import React, { useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { motion, AnimatePresence } from 'framer-motion';
import { TileType, GameState } from '../types/game';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  font-family: "Comic Sans MS", "Comic Sans", cursive, "Arial Rounded MT Bold", Arial, sans-serif;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 5px;
  }
`;

const sway = keyframes`
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(3deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(5deg); }
`;

const GrassDecoration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
`;

const GrassGroup = styled.div<{ $delay: number; $duration: number }>`
  position: absolute;
  display: flex;
  gap: 4px;
  transform-origin: bottom;
  animation: ${sway} ${props => props.$duration}s infinite;
  animation-delay: ${props => props.$delay}s;
`;

const GrassBlade = styled.div<{ $height: number }>`
  width: 2px;
  height: ${props => props.$height}px;
  background: #228B22;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background: #228B22;
    border-radius: 50%;
  }
`;

const Flower = styled.div<{ $delay: number; $duration: number; $color: string }>`
  position: absolute;
  width: 20px;
  height: 20px;
  background: ${props => props.$color};
  border-radius: 50%;
  animation: ${float} ${props => props.$duration}s infinite;
  animation-delay: ${props => props.$delay}s;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    background: #87CEEB;
    border-radius: 50%;
    box-shadow: 0 0 5px rgba(135, 206, 235, 0.5);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 3px;
    height: 3px;
    background: #4169E1;
    border-radius: 50%;
  }
`;

const Board = styled.div`
  position: relative;
  width: 900px;
  height: 700px;
  background: linear-gradient(135deg, #98FB98 0%, #90EE90 100%);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    height: 60vh;
    padding: 8px;
  }
`;

const SlotContainer = styled.div`
  display: flex;
  gap: 10px;
  padding: 15px;
  background: #8B4513;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  min-height: 120px;
  align-items: center;
  border: 4px solid #654321;
  position: relative;
  width: 900px;
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 8px;
    gap: 5px;
    min-height: 80px;
    margin-bottom: 10px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%);
    border-radius: 8px;
    pointer-events: none;
  }
`;

const Slot = styled.div<{ $isEmpty: boolean }>`
  width: 100px;
  height: 100px;
  border: 3px solid ${props => props.$isEmpty ? '#654321' : '#8B4513'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$isEmpty ? 'rgba(0, 0, 0, 0.2)' : '#8B4513'};
  position: relative;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    border-width: 2px;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%);
    border-radius: 5px;
    pointer-events: none;
  }
`;

const TILE_SIZE = 100; // 拼图块的大小
const OVERLAP_THRESHOLD = 50; // 重叠检测阈值

const isOverlapping = (tile1: TileType, tile2: TileType): boolean => {
  const rect1 = {
    left: tile1.position.x,
    right: tile1.position.x + TILE_SIZE,
    top: tile1.position.y,
    bottom: tile1.position.y + TILE_SIZE
  };

  const rect2 = {
    left: tile2.position.x,
    right: tile2.position.x + TILE_SIZE,
    top: tile2.position.y,
    bottom: tile2.position.y + TILE_SIZE
  };

  // 检查两个矩形是否重叠
  const isOverlap = !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );

  if (!isOverlap) return false;

  // 计算重叠面积
  const overlapWidth = Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left);
  const overlapHeight = Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top);
  const overlapArea = overlapWidth * overlapHeight;

  return overlapArea > OVERLAP_THRESHOLD * OVERLAP_THRESHOLD;
};

const isTileBlocked = (tile: TileType, allTiles: TileType[][], row: number, col: number): boolean => {
  if (tile.isMatched) return true;

  // 检查是否被其他未匹配的拼图块遮挡
  for (let i = 0; i < allTiles.length; i++) {
    for (let j = 0; j < allTiles[i].length; j++) {
      const otherTile = allTiles[i][j];
      if (!otherTile.isMatched && 
          (i !== row || j !== col) && 
          isOverlapping(tile, otherTile) &&
          otherTile.position.y <= tile.position.y) { // 只检查上方的拼图块
        return true;
      }
    }
  }
  return false;
};

const Tile = styled(motion.div)<{ 
  $isSelected: boolean; 
  $isMatched: boolean; 
  $top: number; 
  $left: number;
  $rotation: number;
  $puzzleType: number;
  $isBlocked: boolean;
}>`
  position: absolute;
  width: ${TILE_SIZE}px;
  height: ${TILE_SIZE}px;
  top: ${props => props.$top}px;
  left: ${props => props.$left}px;
  display: ${props => props.$isMatched ? 'none' : 'flex'};
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-family: "Comic Sans MS", "Comic Sans", cursive, "Arial Rounded MT Bold", Arial, sans-serif;
  background: ${props => props.$isSelected ? '#ffd700' : 'white'};
  border-radius: ${props => {
    switch (props.$puzzleType) {
      case 0: return '50% 50% 50% 50%';
      case 1: return '60% 40% 40% 60%';
      case 2: return '40% 60% 60% 40%';
      case 3: return '45% 55% 45% 55%';
      default: return '50%';
    }
  }};
  cursor: ${props => props.$isBlocked ? 'not-allowed' : 'pointer'};
  user-select: none;
  box-shadow: ${props => props.$isSelected ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.15)'};
  transform: rotate(${props => props.$rotation}deg);
  transform-origin: center center;
  z-index: ${props => props.$isSelected ? 2 : 1};
  transition: z-index 0s;
  border: 3px solid #e0e0e0;
  opacity: ${props => props.$isBlocked ? 0.6 : 1};
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: ${TILE_SIZE * 0.6}px;
    height: ${TILE_SIZE * 0.6}px;
    font-size: 32px;
    border-width: 2px;
  }

  &:hover {
    z-index: ${props => props.$isBlocked ? 1 : 3};
    transform: ${props => !props.$isBlocked && `rotate(${props.$rotation}deg) scale(1.1)`};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: inherit;
    pointer-events: none;
  }
`;

const GameStatus = styled.div`
  margin-top: 20px;
  font-size: 28px;
  font-weight: bold;
  color: #4a4a4a;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-top: 10px;
  }
`;

const GameOverOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  z-index: 1000;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const RestartButton = styled.button`
  margin-top: 20px;
  padding: 12px 24px;
  font-size: 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 18px;
    margin-top: 15px;
  }

  &:hover {
    background: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SYMBOLS = ['🍎', '🍌', '🍇', '🍊', '🍓', '🍐', '🥝', '🍋'];
const TILES_PER_SYMBOL = 3; // 确保每个符号都是3的倍数
const TOTAL_SYMBOLS = SYMBOLS.length;
const TOTAL_TILES = TOTAL_SYMBOLS * TILES_PER_SYMBOL; // 实际的图案总数
const BOARD_SIZE = { rows: 12, cols: 8 };

// 定义不同的区域
const AREAS = {
  left: { x: [50, 250], y: [100, 600] },
  right: { x: [650, 850], y: [100, 600] },
  top: { x: [250, 650], y: [50, 200] },
  bottom: { x: [250, 650], y: [500, 650] },
  center: { x: [300, 600], y: [250, 450] }
};

const getRandomPosition = () => {
  // 随机选择一个区域
  const areas = Object.values(AREAS);
  const area = areas[Math.floor(Math.random() * areas.length)];
  
  // 在选定的区域内生成随机位置
  const x = area.x[0] + Math.random() * (area.x[1] - area.x[0]);
  const y = area.y[0] + Math.random() * (area.y[1] - area.y[0]);

  return {
    x,
    y,
    rotation: Math.random() * 360,
    puzzleType: Math.floor(Math.random() * 4)
  };
};

const createInitialBoard = (): TileType[][] => {
  const tiles: TileType[][] = [];
  const allSymbols: string[] = [];
  
  // 为每个符号创建正好3个副本
  SYMBOLS.forEach(symbol => {
    for (let i = 0; i < TILES_PER_SYMBOL; i++) {
      allSymbols.push(symbol);
    }
  });
  
  // 随机打乱符号顺序
  const shuffledSymbols = allSymbols.sort(() => Math.random() - 0.5);

  // 创建一个扁平的拼图块数组
  const flatTiles: TileType[] = shuffledSymbols.map((symbol, index) => {
    const { x, y, rotation, puzzleType } = getRandomPosition();
    return {
      id: `tile-${index}`,
      type: symbol,
      isSelected: false,
      isMatched: false,
      position: { x, y },
      rotation,
      puzzleType
    };
  });

  // 计算需要的行数
  const rowSize = Math.ceil(TOTAL_TILES / BOARD_SIZE.cols);
  
  // 将扁平数组转换为二维数组
  for (let i = 0; i < rowSize; i++) {
    tiles[i] = flatTiles.slice(i * BOARD_SIZE.cols, (i + 1) * BOARD_SIZE.cols);
    // 如果最后一行不足，用空值填充
    while (tiles[i] && tiles[i].length < BOARD_SIZE.cols) {
      tiles[i].push({
        id: `empty-${i}-${tiles[i].length}`,
        type: '',
        isSelected: false,
        isMatched: true, // 标记为已匹配，这样就不会显示
        position: { x: 0, y: 0 },
        rotation: 0,
        puzzleType: 0
      });
    }
  }

  return tiles;
};

interface SlotTile extends TileType {
  slotIndex: number;
}

const SlotTile = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-family: "Comic Sans MS", "Comic Sans", cursive, "Arial Rounded MT Bold", Arial, sans-serif;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  border: 2px solid #e0e0e0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 32px;
    border-width: 1px;
  }
`;

interface MatchedGroup {
  type: string;
  indices: number[];
}

const PuzzleGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    tiles: createInitialBoard(),
    selectedTiles: [],
    matchedCount: 0,
    totalTiles: TOTAL_TILES,
  });

  const [slots, setSlots] = useState<(SlotTile | null)[]>(Array(7).fill(null));
  const [isGameOver, setIsGameOver] = useState(false);
  const [matchingGroup, setMatchingGroup] = useState<MatchedGroup | null>(null);

  const checkSlotsForMatch = (newSlots: (SlotTile | null)[]): MatchedGroup | null => {
    const occupiedSlots = newSlots.filter(slot => slot !== null) as SlotTile[];
    const groups = occupiedSlots.reduce((acc, slot) => {
      if (!acc[slot.type]) {
        acc[slot.type] = [];
      }
      acc[slot.type].push(slot);
      return acc;
    }, {} as Record<string, SlotTile[]>);

    // 检查是否有三个相同的图案
    for (const type in groups) {
      if (groups[type].length >= 3) {
        // 找到匹配的三个位置
        const matchedSlots = groups[type].slice(0, 3);
        const matchedIndices = matchedSlots.map(slot => slot.slotIndex);
        return { type, indices: matchedIndices };
      }
    }
    return null;
  };

  const handleMatch = (match: MatchedGroup) => {
    setMatchingGroup(match);
    // 延迟消除，给玩家时间看到匹配
    setTimeout(() => {
      setSlots(prev => {
        const newSlots = [...prev];
        match.indices.forEach(index => {
          newSlots[index] = null;
        });
        return newSlots;
      });

      setGameState(prev => ({
        ...prev,
        matchedCount: prev.matchedCount + 3
      }));

      setMatchingGroup(null);
    }, 800); // 给玩家800ms的时间看到匹配
  };

  const handleTileClick = (row: number, col: number) => {
    const tile = gameState.tiles[row][col];
    if (tile.isMatched || isTileBlocked(tile, gameState.tiles, row, col)) return;

    // 如果正在进行匹配动画，不允许新的操作
    if (matchingGroup) return;

    // 找到第一个空槽位
    const emptySlotIndex = slots.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) {
      setIsGameOver(true);
      return;
    }

    // 将拼图放入槽位
    const slotTile: SlotTile = {
      ...tile,
      slotIndex: emptySlotIndex,
      rotation: 0
    };

    // 创建新的槽位数组并立即检查匹配
    const newSlots = [...slots];
    newSlots[emptySlotIndex] = slotTile;

    // 标记原始拼图为已匹配
    const newTiles = gameState.tiles.map((tileRow, i) =>
      tileRow.map((t, j) => ({
        ...t,
        isMatched: i === row && j === col ? true : t.isMatched
      }))
    );

    // 更新游戏状态
    setGameState(prev => ({
      ...prev,
      tiles: newTiles
    }));

    // 更新槽位
    setSlots(newSlots);

    // 立即检查是否有匹配
    const match = checkSlotsForMatch(newSlots);
    if (match) {
      handleMatch(match);
    }
  };

  const handleRestart = () => {
    setGameState({
      tiles: createInitialBoard(),
      selectedTiles: [],
      matchedCount: 0,
      totalTiles: TOTAL_TILES,
    });
    setSlots(Array(7).fill(null));
    setIsGameOver(false);
  };

  const isGameWon = gameState.matchedCount === gameState.totalTiles;

  // 修改创建草和花的组合函数，使其在移动设备上更合适
  const createGrassFlowerGroups = () => {
    const groups = [];
    const isMobile = window.innerWidth <= 768;
    const grassCount = isMobile ? 8 : 12;
    const flowerCount = isMobile ? 1 : 2;

    for (let i = 0; i < grassCount; i++) {
      const left = `${Math.random() * 100}%`;
      const bottom = `${Math.random() * 100}%`;
      const rotation = Math.random() * 40 - 20;
      
      groups.push(
        <GrassGroup
          key={`grass-${i}`}
          $delay={Math.random() * 3}
          $duration={2 + Math.random() * 3}
          style={{
            left,
            bottom,
            transform: `rotate(${rotation}deg)`
          }}
        >
          <GrassBlade $height={isMobile ? 10 + Math.random() * 8 : 15 + Math.random() * 10} />
          <GrassBlade $height={isMobile ? 12 + Math.random() * 8 : 20 + Math.random() * 10} />
          <GrassBlade $height={isMobile ? 11 + Math.random() * 8 : 18 + Math.random() * 10} />
        </GrassGroup>
      );

      for (let j = 0; j < flowerCount; j++) {
        const flowerOffset = {
          left: `${Math.random() * 40 - 20}%`,
          bottom: `${Math.random() * 40 - 20}%`
        };
        groups.push(
          <Flower
            key={`flower-${i}-${j}`}
            $delay={Math.random() * 3}
            $duration={3 + Math.random() * 3}
            $color={['#87CEEB', '#00BFFF', '#1E90FF', '#4169E1'][Math.floor(Math.random() * 4)]}
            style={{
              left: `calc(${left} + ${flowerOffset.left})`,
              bottom: `calc(${bottom} + ${flowerOffset.bottom})`,
              transform: `rotate(${Math.random() * 360}deg)`,
              width: isMobile ? '16px' : '20px',
              height: isMobile ? '16px' : '20px'
            }}
          />
        );
      }
    }
    return groups;
  };

  return (
    <GameContainer>
      <SlotContainer>
        {slots.map((slot, index) => (
          <Slot key={index} $isEmpty={!slot}>
            {slot && (
              <SlotTile
                initial={{ scale: 1 }}
                animate={{ 
                  scale: matchingGroup?.indices.includes(index) ? [1, 1.1, 1] : 1,
                  backgroundColor: matchingGroup?.indices.includes(index) ? '#FFD700' : '#8B4513'
                }}
                transition={{
                  duration: 0.4,
                  repeat: matchingGroup?.indices.includes(index) ? 1 : 0,
                  ease: "easeInOut"
                }}
              >
                {slot.type}
              </SlotTile>
            )}
          </Slot>
        ))}
      </SlotContainer>
      <Board>
        <GrassDecoration>
          {createGrassFlowerGroups()}
        </GrassDecoration>
        {isGameOver && (
          <GameOverOverlay>
            <div>游戏结束！槽位已满</div>
            <RestartButton onClick={handleRestart}>重新开始</RestartButton>
          </GameOverOverlay>
        )}
        <AnimatePresence mode="popLayout">
          {gameState.tiles.map((row, i) =>
            row.map((tile, j) => {
              if (tile.isMatched) return null;
              const isBlocked = isTileBlocked(tile, gameState.tiles, i, j);
              return (
                <Tile
                  key={tile.id}
                  $isSelected={false}
                  $isMatched={tile.isMatched}
                  $top={tile.position.y}
                  $left={tile.position.x}
                  $rotation={tile.rotation}
                  $puzzleType={tile.puzzleType}
                  $isBlocked={isBlocked}
                  onClick={() => handleTileClick(i, j)}
                  initial={{ scale: 1, opacity: 1 }}
                  whileHover={{ 
                    scale: isBlocked ? 1 : 1.1,
                    zIndex: isBlocked ? 1 : 3,
                    transition: { duration: 0.2 }
                  }}
                  exit={{ 
                    scale: 0,
                    opacity: 0,
                    transition: { duration: 0.3 }
                  }}
                  layout
                >
                  {tile.type}
                </Tile>
              );
            })
          )}
        </AnimatePresence>
      </Board>
      <GameStatus>
        {isGameWon ? '🎉 恭喜你赢了！' : `已消除: ${gameState.matchedCount} / ${gameState.totalTiles}`}
      </GameStatus>
    </GameContainer>
  );
};

export default PuzzleGame; 
