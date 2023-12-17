/*
middleware 
the asyncHandler function is a middleware that simplifies error handling
for asynchronous route handler functions
by catching errors and sending a standardized JSON response.
*/
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((error) => { next(error) })
    }
}


export { asyncHandler }

// Another Apporach


// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
