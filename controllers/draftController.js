import mongoose from "mongoose";
import { Draft } from "../models/draftModel.js";

export const getAllDrafts = async (req, res) => {
    const { page = 1, type } = req.query;

    const school = req.school;
    const draftsPerPage = 5;
    const skipDrafts = draftsPerPage * (page - 1);
    // Base query to fetch drafts for the school
    let query = { school_id: school._id };

    if (type) {
        query.data_type = type;
    }

    try {
        const totalDrafts = await Draft.countDocuments(query);
        const lastPage = Math.ceil(totalDrafts / draftsPerPage);
        const lastPageUrl = `/schools/${school._id}/drafts?page=${lastPage}`;

        // Fetch paginated draft list
        const draftList = await Draft.find(query)
            .limit(draftsPerPage)
            .skip(skipDrafts);

        res.status(200).json({
            drafts: draftList,
            per_page: draftsPerPage,
            total_items: totalDrafts,
            last_page_url: lastPageUrl,
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving drafts", error });
    }
};

// Add new draft
export const addNewDraft = async (req, res) => {
    const { school_id, data_type, data } = req.body;


    try {
        const newDraft = new Draft({
            school_id,
            data_type,
            data,
        });

        const savedDraft = await newDraft.save();
        res.status(201).json({
            message: "Draft added successfully!",
            draft: savedDraft,
        });
    } catch (error) {
        res.status(400).json({ message: "Error adding draft", error });
    }
};

// View specific draft details
export const viewDraftDetails = async (req, res) => {
    const { draft_id: draftId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(draftId)) {
        return res.status(400).json({ message: "Invalid draft ID" });
    }

    try {
        const draft = await Draft.findById(draftId);
        if (!draft) {
            return res.status(404).json({ message: "Draft not found" });
        }
        res.status(200).json({
            draft_details: draft,
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving draft details", error });
    }
};

// Remove a draft
export const removeDraft = async (req, res) => {
    const { draft_id: draftId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(draftId)) {
        return res.status(400).json({ message: "Invalid draft ID" });
    }

    try {
        const existingDraft = await Draft.findByIdAndDelete(draftId);
        if (!existingDraft) {
            return res.status(404).json({ message: "Draft not found" });
        }
        res.status(200).json({ message: "Draft deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting draft", error });
    }
};
