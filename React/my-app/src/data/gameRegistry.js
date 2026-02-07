import gamesData from './games.json';
import Game1 from '../games/Game1';
import EggFly from '../games/EggFly';
import CrystalRace from '../games/CrystalRace';
import GlitterMaze from '../games/GlitterMaze';
import MagicPaint from '../games/MagicPaint';
import StarCatcher from '../games/StarCatcher';

// Mapped components
const componentMap = {
    'Game1': Game1,
    'EggFly': EggFly,
    'DragonFlyer': EggFly, // Keep old name just in case, or remove. Removal is cleaner but user might have other refs. I'll remove it since I updated json.
    'CrystalRace': CrystalRace,
    'GlitterMaze': GlitterMaze,
    'MagicPaint': MagicPaint,
    'StarCatcher': StarCatcher,
};

export const getGames = () => {
    return gamesData.map(game => ({
        ...game,
        component: componentMap[game.component] || null
    }));
};
