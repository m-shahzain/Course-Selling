const express = require("express");
const multer = require("multer");
const { foradmin, foruser } = require("../middleware/auth");
const { cloudinary } = require("../cloudinary");
const router = express.Router();
const {Admin,User,Course}=require("../db")

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Admin-only route
router.get("/admindashboard", foradmin, (req, res) => {
    res.json({ 
        message: "Admin dashboard", 
        admin: req.admin 
    });
});

// User-only route
router.get("/userprofile", foruser, (req, res) => {
    res.json({ 
        message: "User profile", 
        user: req.user 
    });
});

// Admin can manage courses
router.post("/admin/courses", foradmin, upload.single('image'), async (req, res) => {
    try {
        const {name, price, description} = req.body;
        let imageurl = "https://via.placeholder.com/300x200?text=Course+Image";
        
        // Upload image to Cloudinary if provided
        if (req.file) {
            const result = await cloudinary.uploader.upload_stream(
                {
                    folder: 'courses',
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        return res.status(500).json({msg: "Image upload failed"});
                    }
                }
            ).end(req.file.buffer);
            
            // Wait for upload to complete
            const uploadPromise = new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'courses',
                        resource_type: 'auto'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(req.file.buffer);
            });
            
            const uploadResult = await uploadPromise;
            imageurl = uploadResult.secure_url;
        }
        
        const course = await Course.create({
            name,
            price,
            description,
            imageurl
        });
        
        res.status(200).json({msg: "course has uploaded", course});
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({msg: "internal server error"});
    }
});

// Get all courses for admin
router.get("/admin/courses", foradmin, async (req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (error) {
        res.status(500).json({msg: "internal server error"});
    }
});

// Delete course
router.delete("/admin/delete-course", foradmin, async (req, res) => {
    try {
        const { courseId } = req.body;
        console.log("Deleting course:", courseId);
        
        const deletedCourse = await Course.findByIdAndDelete(courseId);
        
        if (!deletedCourse) {
            return res.status(404).json({msg: "course not found"});
        }
        
        res.json({msg: "course deleted successfully"});
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({msg: "internal server error"});
    }
});
// User can view all available courses
router.get("/user/courses", foruser, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get all courses
        const allCourses = await Course.find({});
        
        // Get user's purchased course IDs
        const user = await User.findById(userId);
        const purchasedCourseIds = user.purchasedCourses.map(purchase => purchase.courseId.toString());
        
        // Filter out already purchased courses
        const availableCourses = allCourses.filter(course => 
            !purchasedCourseIds.includes(course._id.toString())
        );
        
        res.json(availableCourses);
    } catch (error) {
        console.error("Get available courses error:", error);
        res.status(500).json({msg: "internal server error"});
    }
});

// User can purchase a course
router.post("/user/purchase-course", foruser, async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;
        
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({msg: "course not found"});
        }
        
        // Check if user already purchased this course
        const user = await User.findById(userId);
        const alreadyPurchased = user.purchasedCourses.some(purchase => 
            purchase.courseId.toString() === courseId
        );
        
        if (alreadyPurchased) {
            return res.status(400).json({msg: "course already purchased"});
        }
        
        // Add course to user's purchased courses
        await User.findByIdAndUpdate(userId, {
            $push: {
                purchasedCourses: {
                    courseId: courseId,
                    purchaseDate: new Date()
                }
            }
        });
        
        res.json({msg: "course purchased successfully"});
    } catch (error) {
        console.error("Purchase error:", error);
        res.status(500).json({msg: "internal server error"});
    }
});

// User can view purchased courses
router.get("/user/purchased-courses", foruser, async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get user with populated purchased courses
        const user = await User.findById(userId).populate('purchasedCourses.courseId');
        
        // Extract course name and purchase date
        const purchasedCourses = user.purchasedCourses.map(purchase => ({
            name: purchase.courseId.name,
            purchaseDate: purchase.purchaseDate
        }));
        
        res.json(purchasedCourses);
    } catch (error) {
        console.error("Get purchased courses error:", error);
        res.status(500).json({msg: "internal server error"});
    }
});

module.exports = router; 