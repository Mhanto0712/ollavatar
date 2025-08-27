import React, { useState, useRef, useEffect } from 'react';
import { History, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { isToken, createMessage, askOllama } from '@/components/api';

interface MessageProps {
  setIsLogin: React.Dispatch<React.SetStateAction<'' | boolean>>;
  accessToken: string;
  setAccessToken: React.Dispatch<React.SetStateAction<string>>;
  message: {
    sender: 'user' | 'ai';
    content: string;
    created_at: string;
  }[];
  setMessage: React.Dispatch<
    React.SetStateAction<
      {
        sender: 'user' | 'ai';
        content: string;
        created_at: string;
      }[]
    >
  >;
  setIsAnswering: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOllamaUrl: React.Dispatch<React.SetStateAction<boolean>>;
}

const Ask: React.FC<MessageProps> = ({
  setIsLogin,
  accessToken,
  setAccessToken,
  message,
  setMessage,
  setIsAnswering,
  setIsOllamaUrl,
}) => {
  const [history, setHistory] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState(false);

  const historRef = useRef<HTMLDivElement>(null);

  const showHistory = () => {
    setHistory(!history);
  };

  const messageToPrompt = (
    message: { sender: 'user' | 'ai'; content: string; created_at: string }[]
  ) => {
    const newMessages: { role: string; content: string }[] = [];
    message.forEach((msg) => {
      newMessages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    });
    return newMessages;
  };

  // User's input will be sent to the Ollama API
  const sendQuestion = async (
    model: string,
    messages: { role: string; content: string }[],
    onStream: (chunk: string) => void
  ) => {
    const response = await isToken(
      setIsLogin,
      accessToken,
      setAccessToken,
      async (access_token) => {
        return await askOllama(model, messages, access_token);
      }
    );

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        onStream(chunk);
      }
    }
  };

  const handleSubmit = async () => {
    if (!question) return;

    setHistory(true);
    // setIsAsking(true);

    const latestQuestion = question;
    const finalPrompt = messageToPrompt(message);
    finalPrompt.push({ role: 'user', content: latestQuestion });
    // console.log(finalPrompt);

    try {
      // Clean up the question
      setQuestion('');

      // Add the user's message
      setMessage((prev) => [
        ...prev,
        { sender: 'user', content: latestQuestion, created_at: '' },
      ]);

      // Add an empty AI message placeholder and remember its index
      let aiIndex: number;
      let aiLastMessage: string;
      setMessage((prev) => {
        aiIndex = prev.length; // position where AI will be
        return [...prev, { sender: 'ai', content: '', created_at: '' }];
      });

      // Stream chunks into that AI message
      await sendQuestion('gemma3', finalPrompt, (chunk) => {
        setMessage((prev) => {
          const updated = [...prev];
          updated[aiIndex] = {
            sender: 'ai',
            content: updated[aiIndex].content + chunk,
            created_at: '',
          };
          setIsAnswering(true);
          aiLastMessage = updated[aiIndex].content;
          return updated;
        });
      });

      // Add user's message to DB
      const userMessage = await isToken(
        setIsLogin,
        accessToken,
        setAccessToken,
        async (access_token) => {
          return await createMessage('user', latestQuestion, access_token);
        }
      );
      // Add ai's message to DB
      const aiMessage = await isToken(
        setIsLogin,
        accessToken,
        setAccessToken,
        async (access_token) => {
          return await createMessage('ai', aiLastMessage, access_token);
        }
      );
      setIsAsking(false);
      setIsAnswering(false);
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
        setIsOllamaUrl(false);
        alert(
          `請聯絡管理員或嘗試更新 Ollama Url ！\n${error?.detail || error}`
        );
      }
    }
  };

  useEffect(() => {
    if (autoScroll && historRef.current) {
      historRef.current.scrollTo({
        top: historRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [message, autoScroll]);

  useEffect(() => {
    if (!history || !historRef.current) {
      setAutoScroll(false);
      return;
    } else {
      setAutoScroll(true);
    }
  }, [history]);

  return (
    <div className='relative w-full h-[10%] flex items-center justify-between gap-4 p-4 text-xl text-white'>
      {history && (
        <div
          ref={historRef}
          className='absolute bottom-1/1 left-0 w-full h-auto max-h-3/1 p-4 pb-2 overflow-y-auto scrollbar hover:scrollbar-thumb-gray-400'
        >
          <div className='flex flex-col gap-4 w-full h-full'>
            {message.map((msg, idx) => (
              <div
                key={idx}
                className={`w-full flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded p-4 opacity-80 ${
                    msg.sender === 'user'
                      ? 'w-2/5 bg-gray-600'
                      : 'w-1/2 bg-gray-950 ring-2 ring-gray-600'
                  }`}
                >
                  {msg.content === '' ? (
                    <div className='flex items-center space-x-2'>
                      <div className='w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin'></div>
                      <span>思考中...</span>
                    </div>
                  ) : msg.sender === 'user' ? (
                    <p className='whitespace-pre-wrap'>{msg.content}</p>
                  ) : (
                    <ReactMarkdown
                      components={{
                        pre: ({ node, ...props }) => (
                          <pre className='whitespace-pre-wrap' {...props} />
                        ),
                        code: ({ node, ...props }) => (
                          <code className='wrap-break-word' {...props} />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <button
        onClick={showHistory}
        disabled={isAsking}
        className='text-gray-500 hover:text-gray-300 cursor-pointer'
      >
        <History className='w-8 h-auto aspect-square' />
      </button>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className='w-full h-full resize-none rounded ring-2 ring-gray-700 bg-gray-800 p-2 scrollbar hover:scrollbar-thumb-gray-400 focus:outline-none focus:ring-gray-500'
        placeholder='輸入你的問題...'
        rows={1}
      />
      <button
        onClick={async () => {
          await handleSubmit();
        }}
        disabled={isAsking}
        className='text-gray-500 hover:text-gray-300 cursor-pointer'
      >
        <Send className='w-8 h-auto aspect-square' />
      </button>
    </div>
  );
};

export default Ask;
