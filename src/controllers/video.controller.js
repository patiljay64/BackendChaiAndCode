import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/fileUpload.cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video
    if (!(title && description)) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoLocalfilePath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalFilePath = req.files?.thumbnail?.[0]?.path;

    if (!(videoLocalfilePath || thumbnailLocalFilePath))
        throw new ApiError(400, "Video and thumbnail are required");

    const videoFile = await uploadOnCloudinary(videoLocalfilePath, "video");
    const thumbnailFile = await uploadOnCloudinary(
        thumbnailLocalFilePath,
        "image"
    );

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnailFile.url,
        title: title,
        description: description,
        time: videoFile?.duration,
        owner: req.user._id,
        isPublished: false,
    });

    if (!video) {
        throw new ApiError(500, "Failed to publish video");
    }

    return res.status(201).json(new ApiResponse(201, "Video published", video));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id

    console.log(videoId);
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
    ]);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    return res.status(200).json(new ApiResponse(200, video, "Video found"));
});

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;
    const { videoId } = req.params;

    const video = await Video.findByIdAndUpdate(
        videoId,
        { title, description },
        { new: true }
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    res.status(200).json(new ApiResponse(200, video, "Video updated"));
});

const updateVideoThambnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const thumbnailLocalFilePath = req.file?.path;

    if (!thumbnailLocalFilePath) {
        throw new ApiError(400, "Thumbnail is required");
    }

    const thumbnailFile = await uploadOnCloudinary(
        thumbnailLocalFilePath,
        "image"
    );

    if (!thumbnailFile) {
        throw new ApiError(500, "Failed to upload thumbnail");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        { thumbnail: thumbnailFile?.url },
        { new: true }
    );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    res.status(200).json(new ApiResponse(200, video, "Thumbnail updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params;
    const video = await Video.findByIdAndDelete(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    res.status(200).json(new ApiResponse(200, null, "Video deleted"));
    // delete on cloudinary
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    const status = (video.isPublished = !video.isPublished);
    await video.save();
    res.status(200).json(
        new ApiResponse(
            200,
            null,
            `Video is now ${status ? "published" : "unpublished"}`
        )
    );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateVideoThambnail,
};
