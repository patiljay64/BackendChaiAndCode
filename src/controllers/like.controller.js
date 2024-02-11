import mongoose, { Types, isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// testing is not done
const toggleVideoLike = asyncHandler(async (req, res) => {
    /**
     * check videoId is valid
     * check user is authenticated {loggedIn}
     * check the video is already liked by user
     *      if yes then dislike
     *      else like the video
     * return response
     */
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(500, "Video id is missing");
    }

    try {
        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "This video id is not valid");
        }

        const userId = req.user?._id;

        if (!isValidObjectId(userId)) {
            throw new ApiError(
                400,
                "You must be logged in for liking the video"
            );
        }

        const isVideoLike = await Like.findById(videoId);

        let like, unlike;

        if (isVideoLike) {
            unlike = await Like.deleteOne({ video: videoId });
        } else {
            like = await Like.create({ video: videoId, likedBy: userId });
        }
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    {},
                    `User ${like ? "like" : "unlike"} the video successfully`
                )
            );
    } catch (error) {
        throw new ApiError(
            400,
            error || "Something went wrong while liking video"
        );
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(500, "Comment id is missing");
    }

    const userId = req.user?._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "You must logged In before liking Comment");
    }

    const isCommentLiked = await Like.findById(commentId);

    let liked;
    let unliked;

    if (isCommentLiked) {
        unliked = await Like.deleteOne({ comment: commentId });
    } else {
        liked = await Like.create({ comment: commentId });
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                `User ${like ? "like" : "unlike"} the comment successfully`
            )
        );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(500, "missing tweet");
    }

    const userId = req.user?._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "You must logged to like the tweet");
    }
    const istweetLiked = await Like.findById(tweetId);

    let like;
    let unlike;

    if (istweetLiked) {
        unlike = await Like.deleteOne({ tweet: tweetId });
    } else {
        like = await Like.create({ tweet: tweetId });
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                `User ${like ? "liked" : "unliked"} the Tweet`
            )
        );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user?._id;
    const likes = await Like.aggregate([
        {
            $match: {
                _id: new Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owners",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1,
                                        fullName: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            $first: { $owner },
                        },
                    },
                ],
            },
        },
    ]);
    if (!likes) {
        throw new ApiError(500, "Something went wrong while gathering data ");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { likedVideo: likes?.[0].likedVideo },
                "liked Videos Fetched Successfully"
            )
        );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };