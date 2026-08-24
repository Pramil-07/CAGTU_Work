"use client"

import React from "react"
import {Avatar, Button, Rating, Textarea} from "@mantine/core"

export interface CommentUser {
    first_name: string
    last_name: string
    profile_image: string
}

export interface Comment {
    id: number
    user: CommentUser
    created_at: string
    updated_at: string
    deleted_at: string | null
    status: string
    rating: number
    review: string
    product: number | null
    blog: number | null
}

interface NewComment {
    review: string
    rating: number
}

interface CommentSectionProps {
    slug: string
    id?: number | null
    productId?: number | null
    comments: Comment[] | null
    newComment: NewComment
    setNewComment: React.Dispatch<React.SetStateAction<NewComment>>
    expandedComments: number[]
    toggleComment: (id: number) => void
    handleCommentSubmit: (e: React.FormEvent) => void
    handleStarClick: (rating: number) => void
    error: string
    isLoggedIn: boolean
    isBlog?:boolean
    isPurchased?: boolean
    isProduct?: boolean
}

export default function CommentSection({
                                           slug,
                                           id,
                                           productId,
                                           comments,
                                           newComment,
                                           setNewComment,
                                           expandedComments,
                                           toggleComment,
                                           handleCommentSubmit,
                                           handleStarClick,
                                           error,
                                           isLoggedIn,
                                           isBlog,
                                           isPurchased,
                                           isProduct,
                                       }: CommentSectionProps) {
    // Render star ratings
    const renderStars = (rating: number, isEditable: boolean = false) => {
        return (
            // <span
            //     key={i}
            //     className={`text-2xl cursor-pointer ${i < rating ? "text-yellow-400" : "text-gray-300"} ${
            //         isEditable ? "hover:text-yellow-600" : ""
            //     }`}
            //     onClick={() => isEditable && handleStarClick(i + 1)}
            // >
            <Rating
                value={rating}
                readOnly={!isEditable}
                onChange={(val) => isEditable && handleStarClick(val)}
                size="md"
                color="yellow"
            />
      // </span>
        )
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm ${isBlog ? "p-5" : ""}`}>
            {isBlog && (
            <h3 className="text-xl sm:text-2xl font-bold mb-6">Comments</h3>
            )}

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="space-y-6 mb-8">
                {comments && comments.length > 0 ? (
                    comments?.map((comment) => (
                    <div key={comment.id} className="flex space-x-4">
                        <Avatar
                            className="w-10 h-10 flex-shrink-0"
                            src={comment.user.profile_image || "/placeholder.svg"}
                            alt={comment.user.first_name}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between space-x-2">
                                <div>
                                  <span className="font-medium text-gray-900 truncate">
                                    {comment.user.first_name} {comment.user.last_name}
                                  </span>
                                    <span className="ml-2 text-gray-900" style={{ fontSize: "0.65rem" }}>
                                    {comment.created_at.split("T")[0]}
                                     </span>
                                </div>
                                <div className="flex">{renderStars(comment.rating)}</div>
                            </div>
                            <p
                                className={`text-gray-700 ${expandedComments.includes(comment.id) ? "" : "line-clamp-2"} mt-1`}
                            >
                                {comment.review}
                            </p>
                            {comment.review.length > 100 && (
                                <button
                                    type="button"
                                    onClick={() => toggleComment(comment.id)}
                                    className="text-orange-500 text-sm hover:underline mt-1"
                                >
                                    {expandedComments.includes(comment.id) ? "View Less" : "View More"}
                                </button>
                            )}
                        </div>
                    </div>
                    ))
                ): (
                    <p className="text-gray-500 italic">No comments yet. {isPurchased ? "Be the first to leave one!" : ""}</p>
                )}
            </div>

            {isLoggedIn &&isProduct && isPurchased ? (
                <div>
                    <h4 className="text-lg sm:text-xl font-semibold mb-4">Leave a Comment</h4>
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                        <div className="flex items-center">{renderStars(newComment.rating, true)}</div>
                        <Textarea
                            placeholder="Write Comment"
                            color="orange"
                            variant="default"
                            value={newComment.review}
                            onChange={(e) => setNewComment((prev) => ({ ...prev, review: e.target.value }))}
                            className="resize-none"
                            minRows={3}
                        />
                        <Button
                            type="submit"
                            color="orange"
                            className="hover:bg-orange-600 text-white w-full sm:w-auto"
                        >
                            Post Comment
                        </Button>
                    </form>
                </div>
            ): isLoggedIn && isBlog && (
                <div>
                    <h4 className="text-lg sm:text-xl font-semibold mb-4">Leave a Comment</h4>
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                        <div className="flex items-center">{renderStars(newComment.rating, true)}</div>
                        <Textarea
                            placeholder="Write Comment"
                            color="orange"
                            variant="default"
                            value={newComment.review}
                            onChange={(e) => setNewComment((prev) => ({...prev, review: e.target.value}))}
                            className="resize-none"
                            minRows={3}
                        />
                        <Button
                            type="submit"
                            color="orange"
                            className="hover:bg-orange-600 text-white w-full sm:w-auto"
                        >
                            Post Comment
                        </Button>
                    </form>
                </div>
            )


            }
        </div>
    )
}