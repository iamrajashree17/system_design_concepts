import { TokenPayload } from '../utils/token.ts';

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}
