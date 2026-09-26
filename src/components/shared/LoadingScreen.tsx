import React from 'react';
import { Center, Loader } from '@mantine/core';

const LoadingScreen: React.FC = () => (
  <Center style={{ minHeight: '100vh' }}>
    <Loader />
  </Center>
);

export default LoadingScreen;
