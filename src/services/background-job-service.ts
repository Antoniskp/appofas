export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface Job {
  id: string
  type: string
  status: JobStatus
  progress: number
  createdAt: string
  completedAt?: string
  error?: string
}

export class BackgroundJobService {
  private jobs: Map<string, Job> = new Map()

  async queueJob(type: string): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const job: Job = {
      id: jobId,
      type,
      status: JobStatus.PENDING,
      progress: 0,
      createdAt: new Date().toISOString()
    }

    this.jobs.set(jobId, job)
    this.processJob(jobId)
    
    return jobId
  }

  async getJobStatus(jobId: string): Promise<Job | null> {
    return this.jobs.get(jobId) || null
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId)
    if (!job) return

    job.status = JobStatus.PROCESSING
    
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 500))
      job.progress = i
      this.jobs.set(jobId, { ...job })
    }

    job.status = JobStatus.COMPLETED
    job.progress = 100
    job.completedAt = new Date().toISOString()
    this.jobs.set(jobId, { ...job })

    setTimeout(() => {
      this.jobs.delete(jobId)
    }, 5000)
  }
}

export const backgroundJobService = new BackgroundJobService()
