\# LensLog — Backend API



The backend REST API for \*\*LensLog\*\*, a photography community platform where users can share photos, follow each other's work, like, comment, and search across the community. Built with Node.js, Express, and MongoDB, following clean MVC architecture.



\*\*Live API:\*\* https://lenslog-backend.onrender.com

\*\*Frontend repo:\*\* https://github.com/ishaansehrawat18/lenslog-frontend



> ⚠️ This is deployed on Render's free tier, which spins down after \~15 minutes of inactivity. The first request after a period of inactivity may take 30-60 seconds to respond while the service wakes up.



\---



\## Features



\- \*\*Authentication\*\* — JWT-based register/login, bcrypt password hashing, protected routes

\- \*\*User profiles\*\* — view/edit profile, profile picture upload, public profile pages by username

\- \*\*Posts\*\* — full CRUD with image upload

\- \*\*Likes\*\* — toggle like/unlike on posts

\- \*\*Comments\*\* — add, view, and delete comments on posts

\- \*\*Search\*\* — search users (by name/username) and posts (by caption/location/tags)

\- \*\*Image storage\*\* — Cloudinary (persistent, CDN-backed — not local disk)

\- \*\*Global error handling\*\* — consistent JSON error responses, proper HTTP status codes

\- \*\*Security\*\* — password hashing, JWT expiration, ownership checks on all mutations, environment-based secrets



\---



\## Tech Stack



| Layer | Technology |

|---|---|

| Runtime | Node.js |

| Framework | Express.js |

| Database | MongoDB (Atlas) with Mongoose ODM |

| Authentication | JWT (jsonwebtoken) + bcrypt |

| File uploads | Multer + Cloudinary |

| Deployment | Render |



\---



\## Folder Structure

lenslog\_backend/

├── config/

│   ├── db.js               # MongoDB connection

│   └── cloudinary.js       # Cloudinary SDK configuration

├── controllers/

│   ├── authController.js   # register, login, getMe

│   ├── userController.js   # profile CRUD, public profile lookup

│   ├── postController.js   # post CRUD, like/unlike

│   ├── commentController.js# comment CRUD

│   └── searchController.js # user/post search

├── middlewares/

│   ├── authMiddleware.js   # JWT verification (protect)

│   ├── uploadMiddleware.js # Multer + Cloudinary storage configs

│   └── errorMiddleware.js  # global 404 + error handler

├── models/

│   ├── User.js

│   ├── Post.js

│   └── Comment.js

├── routes/

│   ├── authRoutes.js

│   ├── userRoutes.js

│   ├── postRoutes.js

│   ├── commentRoutes.js

│   └── searchRoutes.js

├── app.js                  # Express app setup, middleware, route mounting

├── server.js               # entry point, loads env vars, connects DB, starts server

└── package.json



\---



\## Installation



\### Prerequisites

\- Node.js (v18+)

\- A MongoDB Atlas account (or local MongoDB instance)

\- A Cloudinary account (free tier)



\### Steps



1\. Clone the repository:

```bash

&#x20;  git clone https://github.com/ishaansehrawat18/lenslog-backend.git

&#x20;  cd lenslog-backend

```



2\. Install dependencies:

```bash

&#x20;  npm install

```



3\. Create a `.env` file in the root (see \[Environment Variables](#environment-variables) below).



4\. Start the development server:

```bash

&#x20;  npm run dev

```

&#x20;  The API will run on `http://localhost:5000` (or whichever `PORT` you set).



5\. For production:

```bash

&#x20;  npm start

```



\---



\## Environment Variables



Create a `.env` file in the project root with the following (see `.env.example` for a template):



| Variable | Description | Example |

|---|---|---|

| `PORT` | Port the server listens on | `5000` |

| `NODE\_ENV` | Environment mode | `development` or `production` |

| `MONGO\_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/lenslog` |

| `JWT\_SECRET` | Secret used to sign JWTs | any long random string |

| `CORS\_ORIGIN` | Allowed frontend origin | `http://localhost:5173` (dev) or your deployed frontend URL (prod) |

| `CLOUDINARY\_CLOUD\_NAME` | Cloudinary account cloud name | from Cloudinary dashboard |

| `CLOUDINARY\_API\_KEY` | Cloudinary API key | from Cloudinary dashboard |

| `CLOUDINARY\_API\_SECRET` | Cloudinary API secret | from Cloudinary dashboard |



⚠️ Never commit `.env` to version control — it's already listed in `.gitignore`.



\---



\## API Endpoints



Base URL (local): `http://localhost:5000`

Base URL (production): `https://lenslog-backend.onrender.com`



\### Auth — `/api/auth`



| Method | Endpoint | Access | Description |

|---|---|---|---|

| POST | `/register` | Public | Register a new user |

| POST | `/login` | Public | Log in, returns JWT |

| GET | `/me` | Private | Get the logged-in user |



\### Users — `/api/users`



| Method | Endpoint | Access | Description |

|---|---|---|---|

| GET | `/profile` | Private | Get logged-in user's profile |

| PUT | `/profile` | Private | Update profile (name, username, bio, picture) |

| GET | `/profile/posts` | Private | Get logged-in user's own posts |

| GET | `/:username` | Public | Get any user's public profile + posts |



\### Posts — `/api/posts`



| Method | Endpoint | Access | Description |

|---|---|---|---|

| GET | `/` | Public | Get all posts (feed), newest first |

| GET | `/:id` | Public | Get a single post by ID |

| POST | `/` | Private | Create a post (multipart, `image` field required) |

| PUT | `/:id` | Private (owner) | Update a post, optional new image |

| DELETE | `/:id` | Private (owner) | Delete a post |

| POST | `/:id/like` | Private | Toggle like/unlike on a post |



\### Comments



| Method | Endpoint | Access | Description |

|---|---|---|---|

| POST | `/api/posts/:id/comments` | Private | Add a comment to a post |

| GET | `/api/posts/:id/comments` | Public | Get all comments for a post |

| DELETE | `/api/comments/:id` | Private (owner) | Delete a comment |



\### Search — `/api/search`



| Method | Endpoint | Access | Description |

|---|---|---|---|

| GET | `/?query=...` | Public | Search users (name/username) and posts (caption/location/tags) |



\### Example Request/Response



\*\*POST `/api/auth/login`\*\*

```json

// Request body

{

&#x20; "email": "ishaan@example.com",

&#x20; "password": "password123"

}



// Response (200)

{

&#x20; "\_id": "6a55548bdd5d8171f32d66bc",

&#x20; "name": "Ishaan Sehrawat",

&#x20; "username": "ishaan18",

&#x20; "email": "ishaan@example.com",

&#x20; "bio": "Photographer exploring the Himalayas",

&#x20; "profileImage": "https://res.cloudinary.com/.../profileImage.jpg",

&#x20; "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

}

```



All error responses follow a consistent shape:

```json

{

&#x20; "success": false,

&#x20; "message": "Descriptive error message"

}

```



\---



\## Security Notes



\- Passwords are hashed with bcrypt before storage — plaintext passwords are never stored or logged

\- JWTs expire after 7 days; the frontend automatically logs the user out on a 401 response

\- All post/comment mutations verify the requester owns the resource before allowing edits/deletes

\- CORS is restricted to a specific frontend origin in production (not wildcard `\*`)

\- Uploaded images are validated by Cloudinary based on actual file content, not just file extension



\---



\## Known Limitations



\- No pagination on `GET /api/posts` or `GET /api/search` yet — fine for small datasets, would need addressing at scale

\- No rate limiting on public endpoints

\- No email verification on registration



\---



\## License



This project was built as a learning/portfolio project. No formal license applied.

