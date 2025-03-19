export type TileType = {
  id: string;
  type: string;
  isSelected: boolean;
  isMatched: boolean;
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  puzzleType: number;
};

export type Position = {
  row: number;
  col: number;
};

export type GameState = {
  tiles: TileType[][];
  selectedTiles: Position[];
  matchedCount: number;
  totalTiles: number;
}; 
