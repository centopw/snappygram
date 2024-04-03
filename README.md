# SnappyGram

## Description

A social media platform that allows users to share their photos and videos with their friends and family. Users can also like and comment on other users' posts. Power by `Next.js` and `Appwirte`.

## Prerequisites

Before you begin, ensure you have met the following requirements (Assumpting you have basic knowledge of `node.js` and `yarn` package manager):
* You have installed the latest version of `node.js`
* You have an `access` to the internet.
* You have installed `yarn` package manager.
* You have installed `git` version control system.

## Usage

To run this project, install it locally using yarn:
```sh
#clone the project
git clone https://centopw/snappygram.git

# move to the folder
cd snappygram
```

After finish cloning the project, please ensure you have the `.env` 

```sh
cp .env.example .env
```

Then open the `.env` file and fill the following environment variables:

```sh
VITE_APPWRITE_URL=
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_STORAGE_ID=
VITE_APPWRITE_USER_COLLECTION_ID=
VITE_APPWRITE_POST_COLLECTION_ID=
VITE_APPWRITE_SAVES_COLLECTION_ID=
```

> Noted: please make sure you have the right relation for each collection!

```sh
# install the dependencies
yarn
```

```sh
# run the project
yarn dev
```
## Contributing

This project build using `NextJS` and `TailwindCSS` to build the Front end, `Appwrite` to build the backend. If you want to contribute to this project, you can fork the project and create a pull request.

