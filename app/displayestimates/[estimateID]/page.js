"use client"

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Estimate() {
  const { estimateID } = useParams();
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    const fetchHtmlContent = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/generateHTML', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estimateID }),
        });
        const html = await response.text();
        console.log(html)
        setHtmlContent(html);
      } catch (error) {
        console.error('Error fetching HTML:', error);
      }
    };

    fetchHtmlContent();


  }, [estimateID])

  const openHtmlInNewTab = () => {
    const newWindow = window.open('');
    newWindow.document.write(htmlContent);
    newWindow.print();
    newWindow.close();
  };

  return (
    <>
      <Button onClick={openHtmlInNewTab}>
        Open estimate page
      </Button>
    </>
  )
}