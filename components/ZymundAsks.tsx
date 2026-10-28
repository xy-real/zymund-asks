'use client';

import { useState } from 'react';
import { QuestionScreen } from './QuestionScreen';
import { SuccessScreen } from './SuccessScreen';

export default function ZymundAsks() {
  const [saidYes, setSaidYes] = useState(false);
  return saidYes ? <SuccessScreen /> : <QuestionScreen onYes={() => setSaidYes(true)} />;
}