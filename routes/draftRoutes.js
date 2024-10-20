import { addNewDraft, getSchoolDrafts, removeDraft, viewDraftDetails } from '../controllers/draftController.js';
import { customRouter } from '../controllers/sharedController.js';
const draftRouter = customRouter()

draftRouter
    .get('/', getSchoolDrafts)  // GET school drafts
    .get('/:draft_id/view-draft-details', viewDraftDetails)  // GET specific draft details
    .post('/add-new-draft', addNewDraft)  // POST new draft
    .delete('/:draft_id/delete-draft', removeDraft);  // DELETE specific draft

export default draftRouter;
