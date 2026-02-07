import gamesData from './games.json';
import Game1 from '../games/Game1';

// Mapped components
const componentMap = {
    'Game1': Game1,
    // Add other game components here
};

export const getGames = () => {
    return gamesData.map(game => ({
        ...game,
        component: componentMap[game.component] || null
    }));
};
