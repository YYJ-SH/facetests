'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import ResultsPage from './components/ResultsPage';
import imagesMetadata from './images-metadata.json';

export default function Home() {
  const [originalImages, setOriginalImages] = useState([]);
  const [processedImages, setProcessedImages] = useState({});
  const [currentOriginalIndex, setCurrentOriginalIndex] = useState(0);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [currentMethod, setCurrentMethod] = useState('');
  const [timer, setTimer] = useState(null); // Timer for the automatic image transition
  const [countdown, setCountdown] = useState(5); // Countdown state for showing the timer

  const allPersons = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];

  useEffect(() => {
    const originals = imagesMetadata.images.filter(img => img.method === 'original');
    const processed = imagesMetadata.images.filter(img => img.method !== 'original');
    
    setOriginalImages(originals);
    setProcessedImages(groupImagesByMethod(processed));
    
    const firstMethod = Object.keys(groupImagesByMethod(processed))[0];
    setCurrentMethod(firstMethod);
    generateOptions(originals[0], groupImagesByMethod(processed)[firstMethod]);
  }, []);

  const groupImagesByMethod = (images) => {
    return images.reduce((acc, img) => {
      if (!acc[img.method]) acc[img.method] = [];
      acc[img.method].push(img);
      return acc;
    }, {});
  };

  const generateOptions = (currentOriginal, methodImages) => {
    const correctPerson = currentOriginal.person;
    const otherPersons = allPersons.filter(p => p !== correctPerson);
    const selectedOthers = otherPersons.sort(() => 0.5 - Math.random()).slice(0, 5);
    const allOptions = [correctPerson, ...selectedOthers].sort(() => 0.5 - Math.random());

    const options = allOptions.map(person => {
      const personImages = methodImages.filter(img => img.person === person);
      return personImages[Math.floor(Math.random() * personImages.length)];
    });

    setCurrentOptions(options);
  };

  const handleNextImage = () => {
    if (currentOriginalIndex < originalImages.length - 1) {
      setCurrentOriginalIndex(currentOriginalIndex + 1);
      const nextMethod = Object.keys(processedImages)[(Object.keys(processedImages).indexOf(currentMethod) + 1) % Object.keys(processedImages).length];
      setCurrentMethod(nextMethod);
      generateOptions(originalImages[currentOriginalIndex + 1], processedImages[nextMethod]);
      setCountdown(5); // Reset countdown when moving to the next image
    } else {
      setShowResults(true);
    }
  };

  const handleImageClick = (selectedPerson) => {
    clearTimeout(timer); // Clear the timer when an option is selected
    setResults([...results, {
      originalPerson: originalImages[currentOriginalIndex].person,
      selectedPerson: selectedPerson,
      correct: originalImages[currentOriginalIndex].person === selectedPerson,
      method: currentMethod,
      intensity: currentOptions.find(opt => opt.person === selectedPerson)?.intensity
    }]);

    handleNextImage();
  };

  useEffect(() => {
    if (!showResults && originalImages.length > 0) {
      clearTimeout(timer);

      // Update the countdown every second
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            handleNextImage();
            clearInterval(interval); // Clear the interval once time runs out
            return 5; // Reset to 5 for the next round
          }
          return prev - 1; // Decrement the countdown
        });
      }, 1000);

      setTimer(interval); // Save the interval ID to the timer state

      return () => clearInterval(interval); // Cleanup the interval on unmount or when image changes
    }
  }, [currentOriginalIndex, originalImages]);

  if (showResults) {
    return <ResultsPage results={results} />;
  }

  if (originalImages.length === 0 || currentOptions.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6">이미지 식별 테스트</h1>
      <div className="mb-6 mx-auto" style={{width: '300px', height: '300px'}}>
        <img 
          src={`images/original/${originalImages[currentOriginalIndex].file}`}
          alt="Original Image"
          className="w-full h-full object-contain rounded-lg shadow-lg"
        />
      </div>
      <p className="text-center mb-4">현재 방법: {currentMethod} {currentMethod !== 'mask' ? `(강도: ${currentOptions[0]?.intensity}%)` : ''}</p>
      <p className="text-center mb-4">이 사람과 일치하는 이미지를 선택하세요:</p>

      {/* Timer Display */}
      <p className="text-center font-bold text-red-500 mb-4">남은 시간: {countdown}초</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {currentOptions.map((option, index) => (
          <div key={index} className="cursor-pointer" onClick={() => handleImageClick(option.person)}>
            <div style={{width: '100%', height: '200px'}}>
              <img 
                src={`/images/${currentMethod}/${option.file}`}
                alt={`Option ${index + 1}`}
                className="w-full h-full object-contain rounded shadow hover:shadow-lg transition-shadow duration-300"
              />
            </div>
            <p className="text-center mt-2">{option.person}</p>
          </div>
        ))}
      </div>
      <p className="text-center mt-6">
        진행: {currentOriginalIndex + 1} / {originalImages.length}
      </p>
    </div>
  );
}
