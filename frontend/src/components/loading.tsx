'use client';
import { useRef, useState, useEffect } from 'react';
import CircularProgress, {
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingProps {
  isLogin: '' | boolean;
}

const CircularProgressWithLabel = (
  props: CircularProgressProps & { value: number }
) => {
  return (
    <Box
      className='w-full h-full flex items-center justify-center'
      sx={{ position: 'relative', display: 'inline-flex' }}
    >
      <CircularProgress
        className='!w-1/4 !h-auto aspect-square'
        sx={{ color: 'oklch(70.7% 0.022 261.325)' }}
        variant='determinate'
        {...props}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          className='!text-4xl max-md:!text-lg'
          variant='caption'
          component='div'
          sx={{ color: 'white' }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
};

const Loading: React.FC<LoadingProps> = ({ isLogin }) => {
  const [progress, setProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 先清掉舊的 interval，避免疊加
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (isLogin === '') {
      // 未登入 → 進度跑到 90% 停住
      timerRef.current = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 500);
    } else {
      // 登入 → 慢慢補到 100%，然後淡出
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimeout(() => setShowLoading(false), 800); // 留時間給淡出動畫
            return 100;
          }
          return prev + 5;
        });
      }, 80);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLogin]);

  return (
    <AnimatePresence>
      {showLoading && (
        <motion.div
          className='fixed w-full h-full flex items-center justify-center bg-gray-950 z-100'
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Box
            className='w-full h-full'
            sx={{ position: 'relative', display: 'inline-flex' }}
          >
            <CircularProgressWithLabel value={progress} />
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
