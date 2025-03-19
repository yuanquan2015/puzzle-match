import React from 'react';
import styled from '@emotion/styled';
import PuzzleGame from './components/PuzzleGame';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

const App: React.FC = () => {
  return (
    <AppContainer>
      <Title>消消乐游戏</Title>
      <PuzzleGame />
    </AppContainer>
  );
};

export default App;
