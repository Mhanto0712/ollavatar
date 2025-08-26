'use client';

import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import VRMAvatar from '@/components/VRMAvatar';
import Nav from '@/components/nav';
import Ask from '@/components/ask';
import Account from '@/components/account';
import Loading from '@/components/loading';
import { useControls } from 'leva';
import { isToken, checkOllamaUrl, getMessage } from '@/components/api';
import { Loader } from '@react-three/drei';

export default function Home() {
  const [isLogin, setIsLogin] = useState<'' | boolean>('');
  const [accessToken, setAccessToken] = useState('');
  const [isOllamaUrl, setIsOllamaUrl] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [message, setMessage] = useState<
    { sender: 'user' | 'ai'; content: string; created_at: string }[]
  >([]);
  const { avatar } = useControls('VRM', {
    avatar: {
      options: {
        Boy: '/models/Vroid_AvatarSample_C.vrm',
        Girl: '/models/Vroid_AvatarSample_A.vrm',
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
          await isToken(
            setIsLogin,
            accessToken,
            setAccessToken,
            async (access_token) => {
              setMessage(await getMessage(access_token));
              await checkOllamaUrl(access_token);
              setIsOllamaUrl(true);
            }
          );
        }
      } catch (error: any) {
        if (
          error?.detail == '更新憑證不存在' ||
          error?.detail == '更新憑證已過期'
        ) {
          alert('請重新登入');
        } else if (error?.detail == '請更新正確的 Ollama URL ！') {
          setIsOllamaUrl(false);
          alert(error?.detail);
        } else {
          alert(`請聯絡管理員！\n${error?.detail || error}`);
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
          setIsOllamaUrl={setIsOllamaUrl}
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
              zIndex: 50,
            }}
          />
        </div>
        {isLogin && isOllamaUrl ? null : (
          <Account
            isLogin={isLogin}
            setIsLogin={setIsLogin}
            accessToken={accessToken}
            setAccessToken={setAccessToken}
            isOllamaUrl={isOllamaUrl}
            setIsOllamaUrl={setIsOllamaUrl}
          />
        )}
        <Ask
          setIsLogin={setIsLogin}
          accessToken={accessToken}
          setAccessToken={setAccessToken}
          message={message}
          setMessage={setMessage}
          setIsAnswering={setIsAnswering}
          setIsOllamaUrl={setIsOllamaUrl}
        />
      </main>
    </div>
  );
}
