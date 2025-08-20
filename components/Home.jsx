'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

export default function HomeClient() {
  const router = useRouter();

  const handleClick = () => {


    // If you want to navigate within the same window
    router.push('http://localhost:8080/api/auth');
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      Connect to Quickbooks
      <div className='justi'>

      </div>
    </Button>
  );
}