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

  const handleImageClick = (selectedPerson) => {
    setResults([...results, {
      originalPerson: originalImages[currentOriginalIndex].person,
      selectedPerson: selectedPerson,
      correct: originalImages[currentOriginalIndex].person === selectedPerson,
      method: currentMethod,
      intensity: currentOptions.find(opt => opt.person === selectedPerson)?.intensity
    }]);

    if (currentOriginalIndex < originalImages.length - 1) {
      setCurrentOriginalIndex(currentOriginalIndex + 1);
      const nextMethod = Object.keys(processedImages)[(Object.keys(processedImages).indexOf(currentMethod) + 1) % Object.keys(processedImages).length];
      setCurrentMethod(nextMethod);
      generateOptions(originalImages[currentOriginalIndex + 1], processedImages[nextMethod]);
    } else {
      setShowResults(true);
    }
  };

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
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />
      </div>
      <p className="text-center mb-4">현재 방법: {currentMethod} {currentMethod !== 'mask' ? `(강도: ${currentOptions[0]?.intensity}%)` : ''}</p>
      <p className="text-center mb-4">이 사람과 일치하는 이미지를 선택하세요:</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {currentOptions.map((option, index) => (
          <div key={index} className="cursor-pointer" onClick={() => handleImageClick(option.person)}>
            <div style={{width: '100%', height: '200px'}}>
              <img 
                src={`/images/${currentMethod}/${option.file}`}
                alt={`Option ${index + 1}`}
                className="w-full h-full object-cover rounded shadow hover:shadow-lg transition-shadow duration-300"
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