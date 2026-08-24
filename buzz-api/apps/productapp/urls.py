"""cagtubuzz URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
"""

from django.urls import path, include
from apps.productapp.api.v1.api import *
from apps.productapp.api.v1.api_cms import *
from apps.productapp.api.v1.categories import *


urlpatterns = [
    path("", ProductCreatesAPIView.as_view(), name="product_create_test"),
    path("list/", ProductListGenericsView.as_view(), name="product-list"),
    path("bulk/", BulkOrderRequestAPIView.as_view(), name="Bulk_order"),
    path("brand/", CMSBrandListCreateAPIViews.as_view(), name="brandlistapi"),
    path(
        "brand/update/<int:id>/",
        CMSBrandRetriveUpdateDeleteAPIVIew.as_view(),
        name="brandlistapiupdate",
    ),
    path("category/", CategoryListAPIView.as_view(), name="categorylistapi"),
    path("category/create/", CategoryCreateAPIView.as_view(), name="categorycreateapi"),
    path(
        "product/merchant/<str:merchant_slug>/",
        ProductListOfMerchant.as_view(),
        name="merchantproductlistapi",
    ),
    # path("product/category/<slug:category_slug>/", ProductListByCategory.as_view(), name="productlistbycategoryapi"),
    path("details/<slug:slug>/", DetailsProductAPIView.as_view(), name="details page"),
    path(
        "category/<slug:category_slug>/",
        ProductGenericListByCategory.as_view(),
        name="productgenericlistbycategoryapi",
    ),
    path(
        "product/brand/<slug:brand_slug>/",
        ProductListByBrand.as_view(),
        name="productlistbybrandapi",
    ),
    path(
        "buzz-mall/products/",
        BuzzProductListAPIView.as_view(),
        name="buzzproductlistapi",
    ),
    # path("wish/", WishListAPIView.as_view(),name="wishlistapi"),
    path("wish/", WishListGenericListAPIView.as_view(), name="wishgenericslistapi"),
    path("wish/clear/", WishListClearAPIView.as_view(), name="wishgenericsdestroyapi"),
    path(
        "wish/<int:product_id>/<int:stock_id>/",
        AddRemoveWishAPIView.as_view(),
        name="addremovewishapi",
    ),
    path("list/", ProductListGenericsView.as_view(), name="product-list"),
    path("cms/list/", CMSProductListGenericsView.as_view(), name="product-search"),
    path("tags/", ProductsListByTagView.as_view(), name="products-by-tag"),
    path("trending/", TrendingProductListAPIView.as_view(), name="trending-products"),
    path("recommend-list/", RecommendedProduct.as_view(), name="product-list"),
    path("popular-list/", PopularProductsAPIView.as_view(), name="popular-list"),
    path(
        "cms/brand/", CMSBrandListCreateAPIView.as_view(), name="cmsbrandlistcreateapi"
    ),
    path(
        "cms/brand/select/", BrandListSelectView.as_view(), name="cmsbrandlistselectapi"
    ),
    path(
        "cms/brand/<int:id>/", BrandUpdateDeleteAPIView.as_view(), name="brandupdateapi"
    ),
    path(
        "cms/brand/multiple-delete/",
        BrandMultipleDeleteAPIView.as_view(),
        name="brandmultipledeleteapi",
    ),
    path("cms/product/", CMSProductGenericAPIView.as_view(), name="productapi"),
    path(
        "cms/product/merchant/<int:merchant_id>/",
        MerchantProductListAPIView.as_view(),
        name="merchantproductapi",
    ),
    path(
        "cms/product/<int:id>/",
        CMSProductPatchandDeleteAPIView.as_view(),
        name="productpatchanddeleteapi",
    ),
    path(
        "cms/product/multiple-delete/",
        CMSProductMultipleDeleteAPIView.as_view(),
        name="productmultipledeleteapi",
    ),
    path(
        "merchant/products/",
        MerchantProductAPIView.as_view(),
        name="merchantproductsapi",
    ),
    path("test/stock/", StockDemoAPIView.as_view(), name="stockapi"),
    path("test/cart/", CartDemoAPIView.as_view(), name="cartapi"),
    path(
        "filestore/thumbnail/",
        ThumbnailFileStoreCreateAPIView.as_view(),
        name="filestorethumbnailcreateapi",
    ),
    path("filestore/", FileStoreCreateAPIView.as_view(), name="filestorecreateapi"),
    path(
        "filestore/remove-bg/",
        RemoveBackgroundFileStoreCreateAPIView.as_view(),
        name="filestoreremovebgapi",
    ),
    path(
        "cms/service/category/grandparent/",
        ServiceCategoryGrandParentListCreateAPIView.as_view(),
        name="service_category_grand_parent_list_create_apiview",
    ),
    path(
        "cms/service/category/parent/",
        ServiceCategoryParentCreateAPIView.as_view(),
        name="service_category_parent_create_apiview",
    ),
    path(
        "cms/service/category/child/",
        ServiceCategoryChildCreateAPIView.as_view(),
        name="service_category_child_create_apiview",
    ),
    path(
        "cms/service/category/<int:id>/",
        CMSServiceCategoryDetailPatchDeleteAPIView.as_view(),
        name="servicecategorydetailapi",
    ),
    path(
        "cms/service/category/multiple-delete/",
        CategoryMultipleDeleteAPIView.as_view(),
        name="categorymultipledeleteapi",
    ),
    path(
        "cms/service/category/child/<int:id>/",
        ServiceCategoryChildListGenericsAPIView.as_view(),
        name="servicecmscategorychildlistapi",
    ),
    path("cms/category/", CMSCategoryListAPI.as_view(), name="cmscategorylistapi"),
    path("cms/service/", CMSServiceAPIView.as_view(), name="serviceapi"),
    # path("cms/product/merchant/<int:merchant_id>/", MerchantProductListAPIView.as_view(),name="merchantproductapi"),
    path(
        "cms/service/<int:id>/",
        CMSServicePatchandDeleteAPIView.as_view(),
        name="productpatchanddeleteapi",
    ),
    path(
        "stock/<int:stock_id>/",
        StockSingleDeleteAPIView.as_view(),
        name="stocksingleapi",
    ),
    path(
        "stock/product/<int:id>/",
        StockProductClearAPIView.as_view(),
        name="stockclearapi",
    ),
    path(
        "stock/multiple-delete/",
        StockMultipleDeleteAPIView.as_view(),
        name="stockmultipledeleteapi",
    ),
    path(
        "cms/category/grandparent/",
        CategoryGrandParentListCreateAPIView.as_view(),
        name="categorycreateapiview",
    ),
    path(
        "cms/category/grandparent/<int:pk>/",
        CategoryRetrieveAndUpdateAPIView.as_view(),
        name="categoryupdatedeleteapiview",
    ),
    path(
        "cms/category/parent/",
        CategoryParentCreateAPIView.as_view(),
        name="categoryparentcreateapiview",
    ),
    path(
        "cms/category/parent/<int:pk>/",
        CategoryParentRetrieveUpdateAPIView.as_view(),
        name="categoryparentretrieveupdateapiview",
    ),
    path(
        "cms/category/child/list/<int:pk>/",
        CategoryChildListAPIView.as_view(),
        name="categorychildlistapiview",
    ),
    path(
        "cms/category/child/",
        CategoryChildCreateAPIView.as_view(),
        name="categorychildcreateapiview",
    ),
    path(
        "cms/category/child/<int:pk>/",
        CategoryChildRetrieveUpdateAPIView.as_view(),
        name="categorychildretrieveupdateapiview",
    ),
    path(
        "cms/category/<int:pk>/",
        CategoryDestroyAPIView.as_view(),
        name="categorydestroyapiview",
    ),
    path(
        "cms/category/multiple-delete/",
        CategoryMultipleDeleteAPIView.as_view(),
        name="categorymultipledeleteapi",
    ),
    path(
        "cms/attribute/select/",
        AttributeListWithoutPaginationListAPIView.as_view(),
        name="attributeslistapiview",
    ),
    path(
        "cms/attribute/",
        AttributeListCreateAPIView.as_view(),
        name="attributelistapiview",
    ),
    path(
        "cms/attribute/<int:pk>/",
        AttributeRetriveUpdateDeleteAPIView.as_view(),
        name="attributeretrieveupdatedeleteapiview",
    ),
    path(
        "cms/attribute/multiple-delete/",
        AttributeMultipleDestroyAPIView.as_view(),
        name="multipledeleteattributeapiview",
    ),
    path(
        "cms/attribute/stock/",
        StockAttributeListCreateAPIView.as_view(),
        name="attributelistapiview",
    ),
    path(
        "cms/attribute/stock/select/",
        StockAttributeListWithoutPaginationListAPIView.as_view(),
        name="stockattributelistapiview",
    ),
    path(
        "cms/attribute/stock/<int:pk>/",
        StockAttributeKeyRetriveUpdateDeleteAPIView.as_view(),
        name="attributeretrieveupdatedeleteapiview",
    ),
    path(
        "cms/attribute/stock/multiple-delete/",
        StockAttributeMultipleDestroyAPIView.as_view(),
        name="multipledeleteattributeapiview",
    ),
    path(
        "cms/product-attribute/<int:product_id>/",
        ProductAttributeCreateAPIView.as_view(),
        name="productattributecreateapiview",
    ),
    path(
        "cms/product/attribute/",
        ProductAttributeUpdateAPIView.as_view(),
        name="productattributeupdateapiview",
    ),
    path("cms/stock/", StockCreateAPIView.as_view(), name="stockcreatepiview"),
    path(
        "cms/stock/product/<int:product_id>/",
        StockListAPIView.as_view(),
        name="stocklistpiview",
    ),
    path(
        "cms/stock/<int:pk>/",
        StockRetireveDestroyUpdateAPIView.as_view(),
        name="stockretrieveupdatedeleteapi",
    ),
    path(
        "cms/stock-attribute/<int:stock_id>/",
        StockAttributeValueCreateAPIView.as_view(),
        name="stockattributeapi",
    ),
    # read excel
    path(
        "cms/attributes/excel/",
        BulkCreateProductPostAPIView.as_view(),
        name="attributesexcel",
    ),
    path(
        "similar-product/<int:pk>/", SimilarProducts.as_view(), name="similarproductapi"
    ),
    path(
        "similar-products/<int:id>/",
        SimilarProductListsAPIView.as_view(),
        name="similarproductapilist",
    ),
    path(
        "cms/product-attribute/list/<int:category_id>/",
        ProductAttributeListView.as_view(),
        name="productattributelistapi",
    ),
    path(
        "cms/stock-attribute/list/<int:product_id>/",
        StockAttributeListView.as_view(),
        name="stockattributelistapi",
    ),
    # # Depreciated
    path(
        "cms/service/category/create/",
        CMSServiceCategoryCreateAPIView.as_view(),
        name="servicecategorycreateapi",
    ),
    path(
        "cms/service/category",
        CMSServiceCategoryListGenericAPIView.as_view(),
        name="servicecategorylistcreateapi",
    ),
    path("top-category/list/", TopCategoryAPIView.as_view(), name="topcategoryapi"),
    path(
        "create-category/create/",
        CreateTopCategoryAPIView.as_view(),
        name="create_top_category",
    ),
    path(
        "create-category/create/<int:id>/",
        UpdateandDeleteTopCategoryAPIView.as_view(),
        name="top_category_update_delete",
    ),
    path("<slug:slug>/", ProductRetrieveView.as_view(), name="product-retrieve"),
    path("<int:id>/update/", ProductUpdateView.as_view(), name="product-update"),
    path("<int:id>/delete/", ProductDeleteView.as_view(), name="product-delete"),
    path("bulk/upload/", BulkProductUpload.as_view(), name="Bulk upload"),
]
