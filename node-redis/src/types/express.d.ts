import { TokenPayload } from '../app/utils/token.js';

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}
