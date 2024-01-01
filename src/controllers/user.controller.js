import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    /* 
    get user the data into fields
    check the fileds are non empty
    check the user is already registered {email, username}
    check for images{iamges, avatar}
    check for the password and other fields is in the requried format
    upload to the cloudinary{avatar}
    create user object 
    user data is properly feed into the db
    remove password and refresh token field from the response
    check for user creation 
    return res
    */

    // checking all the fields are non empty
    const { fullName, username, email, password } = req.body;
    console.log(fullName, email, username, password);

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // checking if the user is already exists
    const existedUser = await User.findOne({
        // $or is a mongoDB special variable
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "username or email is already exists ");
    }

    // console.log(req.files);
    // checking for the image files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.lenghth > 0
    ) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // uploading to the cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const cover = await uploadOnCloudinary(coverImageLocalPath);

    // checking if the avater is in DB
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }
    // insertiong to the DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: cover?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });
    // checking the user is created or not
    const createdUserCheck = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUserCheck) {
        throw new ApiError(500, "Something went wrong while creating a user");
    }
    // returning the response
    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUserCheck, "User created successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    /* 
     req body → data
    username or email
    find the user
    password check
    access and referesh token
    send cookie
    */

    const { email, password, username } = req.body;
    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(404, "User Doesn't Exists");
    }

    const ispasswordValid = await user.isPasswordCorrect(password);

    if (!ispasswordValid) {
        throw new ApiError(401, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    // cookies
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User Logged In Successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookies("accessToken", options)
        .clearCookies("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out Successfully"));
});

export { registerUser, loginUser, logoutUser };

// [Object: null prototype] {
//     avatar: [
//       {
//         fieldname: 'avatar',
//         originalname: 'profile-pic.png',
//         encoding: '7bit',
//         mimetype: 'image/png',
//         destination: './public/temp',
//         filename: 'profile-pic.png',
//         path: 'public\\temp\\profile-pic.png',
//         size: 303777
//       }
//     ],
//     coverImage: [
//       {
//         fieldname: 'coverImage',
//         originalname: 'Collage_id.jpg',
//         encoding: '7bit',
//         mimetype: 'image/jpeg',
//         destination: './public/temp',
//         filename: 'Collage_id.jpg',
//         path: 'public\\temp\\Collage_id.jpg',
//         size: 193519
//       }
//     ]
//   }
