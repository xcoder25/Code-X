
'use client';

import { useLoading } from '@/context/loading-provider';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

export default function LoadingOverlay() {
  const { isLoading } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[101] flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
          >
            <Image
              src="/my logo.png"
              alt="Code-X Logo"
              width={80}
              height={80}
              className="animate-pulse"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
