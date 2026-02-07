// Dynamically import all images from the GameCovers directory
const gameCovers = import.meta.glob('../assets/GameCovers/*.{png,jpg,jpeg,webp,svg}', { eager: true });

export const getGameCover = (imageName) => {
    if (!imageName) return null;

    // Iterate through the keys to find a match
    for (const path in gameCovers) {
        if (path.includes(imageName)) {
            return gameCovers[path].default;
        }
    }

    // Default fallback if no image is found or provided
    // You might want to have a specific default image in your assets
    return null;
};
