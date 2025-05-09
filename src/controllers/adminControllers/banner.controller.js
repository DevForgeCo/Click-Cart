import { Banner } from "../../models/adminModels/banner.model.js";

const createBanner = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required." });
    }

    const newBanner = await Banner.create({ imageUrl });

    res
      .status(201)
      .json({ message: "Banner created successfully.", banner: newBanner });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// const updateBanner = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { imageUrl, isActive } = req.body;

//     const updatedBanner = await Banner.findByIdAndUpdate(
//       id,
//       { imageUrl, isActive },
//       { new: true }
//     );

//     if (!updatedBanner) {
//       return res.status(404).json({ message: "Banner not found." });
//     }

//     res
//       .status(200)
//       .json({ message: "Banner updated successfully.", banner: updatedBanner });
//   } catch (error) {
//     console.error("Error updating banner:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// const searchBanners = async (req, res) => {
//   try {
//     const { title } = req.query;

//     if (!title) {
//       return res.status(400).json({ message: "Search title is required." });
//     }

//     const banners = await Banner.find({
//       title: { $regex: title, $options: "i" },
//     }).sort({ createdAt: -1 });

//     res.status(200).json({ banners });
//   } catch (error) {
//     console.error("Error searching banners:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBanner = await Banner.findByIdAndDelete(id);

    if (!deletedBanner) {
      return res.status(404).json({ message: "Banner not found." });
    }

    res.status(200).json({ message: "Banner deleted successfully." });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { createBanner, getAllBanners, deleteBanner };
