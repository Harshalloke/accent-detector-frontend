'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Trash2, Eye } from 'lucide-react'
import { motion } from 'framer-motion'

interface Detection {
  id: string
  transcription: string
  accent: string
  confidence: string
  reasoning: string
  created_at: string
}

export default function Dashboard() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingDetection, setViewingDetection] = useState<Detection | null>(null) // Fixed: Renamed variable
  
  const supabase = createClient()

  const fetchDetections = useCallback(async () => { // Fixed: Memoized function
    try {
      const { data, error } = await supabase
        .from('detections')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDetections(data || [])
    } catch (error) {
      console.error('Error fetching detections:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchDetections()
  }, [fetchDetections]) // Fixed: Added proper dependency

  const deleteDetection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('detections')
        .delete()
        .eq('id', id)

      if (error) throw error
      setDetections(detections.filter(d => d.id !== id))
    } catch (error) {
      console.error('Error deleting detection:', error)
    }
  }

  const getAccentFlag = (accent: string) => {
    const flags: { [key: string]: string } = {
      'American': '🇺🇸',
      'British': '🇬🇧',
      'Australian': '🇦🇺',
      'Indian': '🇮🇳',
      'Canadian': '🇨🇦',
      'Irish': '🇮🇪',
      'Scottish': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'South African': '🇿🇦',
      'New Zealand': '🇳🇿',
      'Nigerian': '🇳🇬',
    }
    return flags[accent] || '🌐'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Accent Detections</CardTitle>
          <CardDescription>
            View and manage your previous accent detection results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No detections yet</p>
              <Button asChild>
                <a href="/detect">Start Detecting</a>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Accent</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Transcription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detections.map((detection) => (
                  <TableRow key={detection.id}>
                    <TableCell>
                      {new Date(detection.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getAccentFlag(detection.accent)}</span>
                        {detection.accent}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{detection.confidence}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      &quot;{detection.transcription}&quot; {/* Fixed: Escaped quotes */}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setViewingDetection(detection)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <span>{getAccentFlag(viewingDetection?.accent || '')}</span>
                                {viewingDetection?.accent} Accent
                              </DialogTitle>
                              <DialogDescription>
                                Detection from {viewingDetection?.created_at ? new Date(viewingDetection.created_at).toLocaleDateString() : ''}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Confidence:</h4>
                                <Badge variant="secondary">{viewingDetection?.confidence}</Badge>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Transcription:</h4>
                                <p className="italic">&quot;{viewingDetection?.transcription}&quot;</p> {/* Fixed: Escaped quotes */}
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Analysis:</h4>
                                <p>{viewingDetection?.reasoning}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteDetection(detection.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
