import { addNewDraft, getAllDrafts, removeDraft, viewDraftDetails } from '../controllers/draftController.js';
import { customRouter } from '../controllers/sharedController.js';
const draftRouter = customRouter()

draftRouter
    .get('/', getAllDrafts)  // GET all drafts
    .get('/view-draft-details/:draft_id', viewDraftDetails)  // GET specific draft details
    .post('/add-new-draft', addNewDraft)  // POST new draft
    .delete('/delete-draft/:draft_id', removeDraft);  // DELETE specific draft

export default draftRouter;
