import Gallery from "../../models/gallery.model.js";
import Event from "../../models/event.model.js";
import type { Request, Response } from "express";
import type { MulterRequest } from "../../type/index.js";
import uploadToCloudinary from "../../cloudinary/uploadToCloudinary.js";


export const addGallery = async (req: Request, res: Response) => {
  try {
    const { event } = req.body;

    const files = (req as any).files;
    const file = files?.image?.[0];

    if (!event || !file) {
      return res.status(400).json({ message: "event or image is required." });
    }


    const events = await Event.findById(event);
    if (!events) {
      return res.status(404).json({ message: "Event not found." });
    }

    if (!file || !file.buffer) return res.status(404).json({ message: "file not found." });

    let type = "";

    if (file.mimetype.startsWith("image")) {
      type = "image";
    } else if (file.mimetype.startsWith("video")) {
      type = "video";
    } else {
      type = "other";
    }

    const imageUrl = await uploadToCloudinary(file.buffer, file.mimetype, "gallery");

    const gallery = await Gallery.create({
      event: events._id,
      image: imageUrl,
      type: type
    });

    if(!events.gallery.includes(gallery?._id)){
      events.gallery.push(gallery?._id);
      await events.save();
    }

     await gallery.populate("event");


    return res.status(201).json({
      message: "Gallery created successfully",
       gallery,
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};

export const getAllGallery = async (req: Request, res: Response) => {
  try {
    const { page, perPage, filterCategory } = req.query;

    // pagination setup
    const currentPage = parseInt(page as string) || 1;
    const limit = parseInt(perPage as string) || 10;
    const skip = (currentPage - 1) * limit;

    // filters
    const filters: any = {};

    if (filterCategory && filterCategory !== "all") {
      filters.event = filterCategory;
    }

    const total = await Gallery.countDocuments(filters);

    const galleries = await Gallery.find(filters)
      .populate("event")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); 

    return res.status(200).json({
      message: "Gallery fetched successfully",
      data: galleries,
      pagination: {
        total,
        currentPage,
        perPage: limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};


export const updateGallery = async (req: Request, res: Response) => {
  try {
    const { id, event, image } = req.body;
   
    const files = (req as MulterRequest).files;

    if (!id) {
      return res.status(400).json({ message: "Gallery ID is required." });
    }
    if(!event) return res.status(400).json({message:"event not found."});

    const existingGallery = await Gallery.findById(id);
    if (!existingGallery) {
      return res.status(404).json({ message: "Gallery not found." });
    }

    let eventId = event;

   
      const events = await Event.findById(event);
      if (!events) {
        return res.status(404).json({ message: "Event not found." });
      }
  
  

    let imageUrl: string = existingGallery.image;
    let type = "image";

    if (files) {
      const fileArray = Array.isArray(files)
        ? files
        : Object.values(files).flat();

      const file = fileArray[0];

      if (file && file.buffer) {

        if (file.mimetype.startsWith("image")) {
          type = "image";
        } else if (file.mimetype.startsWith("video")) {
          type = "video";
        } else {
          type = "other";
        }

        imageUrl = await uploadToCloudinary(
          file.buffer,
          file.mimetype,
          "gallery"
        );
      }
    }

    else if (image && typeof image === "string") {
      imageUrl = image;
    }

    const updatedGallery = await Gallery.findByIdAndUpdate( id, { event: eventId, image: imageUrl, type:type}, { new: true } );
     await updatedGallery?.populate("event");

    return res.status(200).json({
      message: "Gallery updated successfully",
      gallery: updatedGallery,
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};



export const deleteGallery = async (req: Request, res: Response) => {
  try {
    const galleryId = req.params.id;
    if (!galleryId) return res.status(400).json({ message: "Gallery Id Not found." });

    const gallery = await Gallery.findByIdAndDelete(galleryId);
    if (!gallery) return res.status(404).json({ message: "Gallery not Found." });

const event = await Event.findById(gallery?.event);
if (event) {
  event.gallery = event.gallery.filter(
    (id: any) => id.toString() !== gallery._id.toString()
  );
  await event.save();
}

    res.status(200).json({ message: "Gallery Delete Successfully." })
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};


export const markAnUnMarkGallery = async (req: Request, res: Response) => {
  try {
    const { galleryId } = req.body;
    if (!galleryId) return res.status(400).json({ message: "GalleryId not Found." });

    const gallery = await Gallery.findById(galleryId);
    if (!gallery) return res.status(404).json({ message: "Gallery Not Found." });

    gallery.important = !gallery?.important;
    await gallery.save();

    res.status(200).json({ message: `This Gallery ${gallery?.important ? "Marked" : "Unmarked"} successfully.` })
  }
  catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
}