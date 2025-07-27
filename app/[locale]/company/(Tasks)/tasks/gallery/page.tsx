'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

interface TaskImage {
  taskId: number;
  title: string;
  imageUrl: string;
  isResult: boolean;
}

export default function TaskGalleryPage() {
  const t = useTranslations("company");
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Fetch task gallery images
  const { data: images, isLoading, error } = useQuery<TaskImage[]>({
    queryKey: ['taskGallery'],
    queryFn: async () => {
      const { data } = await apiClient.get('https://nedx.premiumasp.net/api/Task/Gallery');
      return data;
    }
  });

  // Filter images based on active tab
  const filteredImages = images?.filter(image => {
    if (activeTab === 'all') return true;
    if (activeTab === 'requirements') return !image.isResult;
    if (activeTab === 'results') return image.isResult;
    return true;
  });

  // Group images by taskId for better organization
  const groupedImages = filteredImages?.reduce((acc, image) => {
    if (!acc[image.taskId]) {
      acc[image.taskId] = [];
    }
    acc[image.taskId].push(image);
    return acc;
  }, {} as Record<number, TaskImage[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-xl font-semibold text-red-600">{t('errors.failedToLoad')}</h2>
        <p className="text-gray-600">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">{t('tasks.gallery.title')}</h1>
      
      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
          <TabsTrigger value="all">{t('tasks.gallery.allFiles')}</TabsTrigger>
          <TabsTrigger value="requirements">{t('tasks.gallery.requirementFiles')}</TabsTrigger>
          <TabsTrigger value="results">{t('tasks.gallery.resultFiles')}</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {groupedImages && Object.keys(groupedImages).length > 0 ? (
        <div>
          {Object.entries(groupedImages).map(([taskId, taskImages]) => (
            <div key={taskId} className="mb-10">
              <h2 className="text-xl font-semibold mb-4">
                {t('tasks.gallery.taskFiles', { taskId })}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {taskImages.map((image, index) => (
                  <Card key={`${image.taskId}-${index}`} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium truncate" title={image.title}>
                        {image.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 relative aspect-square">
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Image
                          src={`https://crmproject.runasp.net${image.imageUrl}`}
                          alt={image.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 flex justify-center items-center">
                      
                      <Link href={`/en/company/tasks/${image.taskId}`} passHref>
                        <Button variant="outline" size="sm">
                          {t('tasks.gallery.viewTask')}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <h3 className="text-xl font-medium text-gray-600">
            {t('tasks.gallery.noImagesFound')}
          </h3>
        </div>
      )}
    </div>
  );
}