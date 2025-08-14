import axios from 'axios';

interface ProjectStatusResponse {
  status: string;
  data: {
    id: number;
    program_name: string;
    is_active: boolean;
  };
}

export async function getProjectStatus(): Promise<boolean> {
  try {
    const response = await axios.get<ProjectStatusResponse>(
      'https://valid-app-production.up.railway.app/api/programs/4'
    );
    
    return response.data.data.is_active;
  } catch (error) {
    console.error('Error fetching project status:', error);
    return false;
  }
} 