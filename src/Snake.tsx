/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast'; // Importa a biblioteca react-hot-toast para notificações
import './App.css';
import { useNavigate } from 'react-router-dom';

// Configuração inicial do tamanho do tabuleiro do jogo
const numRows = 20;
const numCols = 20;

// Interface para definir o tipo de um segmento (parte da cobra ou comida)
interface Segment {
  x: number;
  y: number;
}

// Estado inicial da cobra, começando em uma posição específica
const initialSnake: Segment[] = [{ x: 8, y: 8 }];
// Direção inicial da cobra
const initialDirection: string = 'ArrowRight';

// Função para gerar uma posição aleatória para a comida
function getRandomFood(snake: Segment[]): Segment {
  let newFood: Segment;
  do {
    newFood = {
      x: Math.floor(Math.random() * numCols),
      y: Math.floor(Math.random() * numRows),
    };
  // Garante que a comida não apareça em um segmento ocupado pela cobra
  } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  return newFood;
}

// Componente Cell otimizado usando React.memo para renderizar cada célula do tabuleiro
const Cell = React.memo(({ isFood, isSnake }: { isFood: boolean; isSnake: boolean }) => (
  <div className={`cell ${isSnake ? 'snake' : ''} ${isFood ? 'food' : ''}`} />
));

// Componente principal do jogo Snake
function Snake() {
  // Estados para gerenciar a cobra, comida, direção, fim de jogo e pontuação
  const navigate = useNavigate();
  const [snake, setSnake] = useState<Segment[]>(initialSnake);
  const [food, setFood] = useState<Segment>(getRandomFood(initialSnake));
  const [dir, setDir] = useState<string>(initialDirection);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  // Estado para controlar a velocidade da cobra
  const [snakeSpeed, setSnakeSpeed] = useState<number>(200);

  // Mapeamento das teclas de direção para mudanças na posição da cobra
  const directions: { [key: string]: Segment } = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };

  // Refs para manter o estado atualizado dentro dos efeitos (useEffect)
  const snakeRef = useRef(snake);
  snakeRef.current = snake;
  const foodRef = useRef(food);
  foodRef.current = food;
  const dirRef = useRef(dir);
  dirRef.current = dir;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const snakeSpeedRef = useRef(snakeSpeed);
  snakeSpeedRef.current = snakeSpeed;

  const animationRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number>(0);

  // Efeito para lidar com a entrada do teclado e definir a direção da cobra
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newDir = directions[e.key];
      if (newDir && e.key !== dirRef.current) {
        setDir(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Efeito para mover a cobra no tabuleiro
  useEffect(() => {
    if (gameOver) return;

    const moveSnake = (time: number) => {
      if (time - lastMoveTimeRef.current > snakeSpeedRef.current) {
        lastMoveTimeRef.current = time;
        // Cria uma nova instância da cobra para o próximo movimento
        const newSnake = [...snakeRef.current];
        // Calcula a nova posição da cabeça da cobra
        const head = { ...newSnake[newSnake.length - 1] };
        head.x += directions[dirRef.current].x;
        head.y += directions[dirRef.current].y;

        // Verifica se a cobra colidiu com as bordas ou consigo mesma
        if (head.x >= numCols || head.x < 0 || head.y >= numRows || head.y < 0 ||
            newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return;
        }

        // Atualiza a posição da cobra no tabuleiro
        newSnake.push(head);
        if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
          // Aumenta o tamanho da cobra se ela comer a comida
          setFood(getRandomFood(newSnake));
          setScore(scoreRef.current + 1);

          // Aumenta a velocidade da cobra a cada 10 comidas coletadas
          if ((scoreRef.current + 1) % 5 === 0 && snakeSpeedRef.current > 40) {
            setSnakeSpeed(snakeSpeedRef.current - 20);
            // Exibe um toast quando a velocidade aumenta
            if(snakeSpeedRef.current >= 160){
              toast('Faster.', {
                duration: 3000,
              });
            }else if(snakeSpeedRef.current >= 120){
              toast('Faster!', {
                duration: 3000,
              });
            }else if(snakeSpeedRef.current >= 80){
              toast('Faster!!!!', {
                duration: 3000,
              });
            }else if(snakeSpeedRef.current >= 40){
              toast('AAAAAAAHHHHHHHH!!!!', {
                duration: 3000,
              });
            }
          }
        } else {
          // Move a cobra removendo o segmento da cauda
          newSnake.shift();
        }

        setSnake(newSnake);
      }

      animationRef.current = requestAnimationFrame(moveSnake);
    };

    animationRef.current = requestAnimationFrame(moveSnake);
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameOver]);

  // Renderiza o componente do jogo
  return (
    <div className="App">
      <Toaster />
      {gameOver ? (
        // Exibe Game Over e a pontuação quando o jogo termina
        <div>
          <h1>Game Over</h1>
          <p>Your score: {score}</p>
          <button onClick={() => {
            // Botão para reiniciar o jogo
            setSnake(initialSnake);
            setFood(getRandomFood(initialSnake));
            setDir(initialDirection);
            setGameOver(false);
            setScore(0);
            setSnakeSpeed(200);
            navigate('/')
          }}>Restart</button>
        </div>
      ) : (
        // Renderiza o tabuleiro do jogo
        <div className="game-board">
          {Array.from(Array(numRows), (_, i) =>
            Array.from(Array(numCols), (_, j) => {
              // Determina se a célula é comida ou parte da cobra
              const isFood = i === food.y && j === food.x;
              const isSnake = snake.some(segment => segment.x === j && segment.y === i);
              return <Cell key={`${i}-${j}`} isFood={isFood} isSnake={isSnake} />;
            })
          )}
        </div>
      )}
    </div>
  );
}

export default Snake;
