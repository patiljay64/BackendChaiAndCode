import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null,"./public/temp");
    },
    filename: function(req,file,ch){
        cb(null,file.originalname)
    }
});

export const uload = multer({
    storage:storage
});