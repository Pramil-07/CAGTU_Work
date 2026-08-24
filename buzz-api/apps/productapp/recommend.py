from .models import Product, Category, Brand
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer


def load_and_process_data():
    try:
        # Load products and handle missing values
        products = pd.DataFrame(list(Product.objects.all().values()))
        if products.empty:
            
            return None, None, None

        products = products.fillna(0).astype(str)
         
        products["brand_id"] = (
            pd.to_numeric(products["brand_id"], errors="coerce")
            .fillna(0)
            .astype(int)
            .astype(str)
        )
      
        # Load categories and handle missing values
        categories = pd.DataFrame(list(Category.objects.all().values()))
        if categories.empty:
            
            return None, None, None

        categories = categories.fillna("").astype(str)
        
        # Drop unnecessary columns
        timestamp = ["created_at", "updated_at", "deleted_at", "status"]
        products = products.drop(
            [
                "id",
                "is_active",
                "type",
                "added_by",
                "thumbnail_image",
                "video_url",
                "product_status",
                "warranty_type",
                "warranty_period",
                "slug",
                "notes",
                "meta_title",
                "meta_description",
                "meta_keyword",
                "user_id",
                *timestamp,
            ],
            axis=1,
            errors="ignore",
        )
        

        categories = categories.drop(
            ["level", "icon", "type", "slug", "parent_id"],
            axis=1,
            errors="ignore",
        )
       

        # Merge products and categories
        Post = pd.merge(
            products, categories, left_on="category_id", right_on="id", how="left"
        )
        if Post.empty:
             
            return None, None, None

        Post = Post.drop(["category_id", "id"], axis=1, errors="ignore")
       

        # Create text column for TF-IDF
        Post["text"] = (
            Post["description"].map(str)
            + " "
            + Post["name_y"].map(str)
            + " "
            + Post["name_x"]
        )
        Post = Post.reset_index(drop=True)
         

        # Check for duplicate product names
        if Post["name_x"].duplicated().any():
            print(
                "Warning: Duplicate product names found:",
                # Post[Post["name_x"].duplicated()]["name_x"],
            )

        # TF-IDF vectorization
        tfid = TfidfVectorizer()
        tfid_post = tfid.fit_transform(Post["text"])
       

        # Cosine similarity
        cos_sin = cosine_similarity(tfid_post, tfid_post)
        

        # Create indices for product names
        indices = pd.Series(Post.index, index=Post["name_x"]).drop_duplicates()
       
        return Post, cos_sin, indices

    except Exception as e:
        
        return None, None, None


# Initialize data
Post, cos_sin, indices = load_and_process_data()


def recommend(name_x, cosine_sim=cos_sin, post=Post, indices=indices):
    if post is None or cosine_sim is None or indices is None:
         
        return []

    if name_x not in post["name_x"].values:
        
        return []

    try:
        # Get the index of the first match
        idx = indices[name_x]
         

        # Ensure idx is a scalar (single index)
        if isinstance(idx, pd.Series):
             
            idx = idx.iloc[0]  # Take the first index if duplicates exist

        # Get similarity scores (ensure 1D array)
        scores = cosine_sim[idx]
         
        if scores.ndim > 1:
            scores = scores.flatten()  # Flatten to 1D if necessary
             

        # Create Series from scores
        score_series = pd.Series(scores, index=post.index).sort_values(ascending=False)
        

        # Pick top 5 (excluding self)
        top_indices = score_series.index[1:6]
        

        # Return product names and scores
        results = post.iloc[top_indices][["name_x", "text"]].copy()
        results["score"] = score_series.iloc[1:6].values
        return results.to_dict(orient="records")
    except Exception as e:
         
        return []
