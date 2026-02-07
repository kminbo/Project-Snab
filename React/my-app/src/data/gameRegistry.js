import gamesData from './games.json';
import Game1 from '../games/Game1';
import DragonFlyer from '../games/DragonFlyer';

// Mapped components
const componentMap = {
    'Game1': Game1,
    'DragonFlyer': DragonFlyer,
};

export const getGames = () => {
    return gamesData.map(game => ({
        ...game,
        component: componentMap[game.component] || null
    }));
};
