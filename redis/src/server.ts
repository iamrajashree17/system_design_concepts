import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRouter from './app/routes/auth.js';
import jobRouter from './app/routes/job.js';

const app = express();

app.use(helmet());

if (process.env.FORCE_HTTPS === 'true') {
    app.set('trust proxy', 1);
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
        }
        return next();
    });
}

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.send('Health check passed');
});

app.use('/auth', authRouter);
app.use('/job', jobRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
