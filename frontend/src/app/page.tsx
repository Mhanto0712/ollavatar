'use client';

import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import VRMAvatar from '@/components/VRMAvatar';
import Nav from '@/components/nav';
import Ask from '@/components/ask';
import Account from '@/components/account';
import Loading from '@/components/loading';
import { useControls } from 'leva';
import { isToken, getMessage } from '@/components/api';
import { Loader } from '@react-three/drei';

export default function Home() {
  const [isLogin, setIsLogin] = useState<'' | boolean>('');
  const [accessToken, setAccessToken] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [message, setMessage] = useState<
    { sender: 'user' | 'ai'; content: string; created_at: string }[]
  >([]);
  const { avatar } = useControls('VRM', {
    avatar: {
      options: {
        AvataSample_C: '/models/Vroid_AvataSample_C.vrm',
        AvataSample_A: '/models/Vroid_AvataSample_A.vrm',
      },
      label: 'Avatar',
    },
  });

  useEffect(() => {
    (async () => {
      try {
        await isToken(setIsLogin, accessToken, setAccessToken);
      } catch (error: any) {
        if (
          error?.detail == '更新憑證不存在' ||
          error?.detail == '更新憑證已過期'
        ) {
          return;
        } else {
          alert(`${error?.detail} 請聯絡管理員`);
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (isLogin) {
          isToken(
            setIsLogin,
            accessToken,
            setAccessToken,
            async (access_token) => {
              setMessage(await getMessage(access_token));
            }
          );
        }
      } catch (error: any) {
        if (
          error?.detail == '更新憑證不存在' ||
          error?.detail == '更新憑證已過期'
        ) {
          alert('請重新登入');
        } else {
          alert(`${error?.detail} 請聯絡管理員`);
        }
      }
    })();
  }, [isLogin]);

  return (
    <div className='w-full h-full'>
      <Loading isLogin={isLogin} />
      <main className='w-full h-full'>
        <Nav
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          setAccessToken={setAccessToken}
        />
        <div className='relative w-full h-[85%]'>
          <Canvas>
            <Suspense fallback={null}>
              <VRMAvatar avatar={avatar} isAnswering={isAnswering} />
            </Suspense>
          </Canvas>
          <Loader
            containerStyles={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              zIndex: 80,
            }}
          />
        </div>
        {isLogin ? null : (
          <Account
            setIsLogin={setIsLogin}
            accessToken={accessToken}
            setAccessToken={setAccessToken}
          />
        )}
        <Ask
          setIsLogin={setIsLogin}
          accessToken={accessToken}
          setAccessToken={setAccessToken}
          message={message}
          setMessage={setMessage}
          setIsAnswering={setIsAnswering}
        />
      </main>
    </div>
  );
}
