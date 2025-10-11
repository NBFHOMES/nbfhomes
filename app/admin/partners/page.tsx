"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UserCheck, Eye, CheckCircle, XCircle, Clock, FileText, Mail, Phone, Calendar } from "lucide-react"
import { toast } from "sonner"

interface PartnerApplication {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  documents: {
    selfie: string
    aadharFront: string
    aadharBack: string
  }
  status: 'pending_review' | 'under_review' | 'approved' | 'rejected' | 'on_hold'
  submittedAt: string
  reviewedAt?: string
  reviewNotes?: string
}

const statusColors = {
  pending_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  under_review: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  on_hold: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

export default function AdminPartnersPage() {
  const [applications, setApplications] = useState<PartnerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<PartnerApplication | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/partner-applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
      } else {
        toast.error('Failed to fetch partner applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/partner-applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          reviewNotes: notes,
          reviewedBy: 'admin' // In a real app, get from auth context
        })
      })

      if (response.ok) {
        toast.success(`Application ${status.replace('_', ' ')} successfully`)
        fetchApplications() // Refresh the list
        setSelectedApplication(null)
        setReviewNotes("")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update application')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusCounts = () => {
    const counts = {
      pending_review: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      on_hold: 0,
    }

    applications.forEach(app => {
      counts[app.status]++
    })

    return counts
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4 w-2/3"></div>
                    <div className="h-8 bg-muted rounded w-24"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Partner <span className="text-gradient">Applications</span>
        </h1>
        <p className="text-muted-foreground">Review and manage partner registration applications</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{statusCounts.pending_review}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold">{statusCounts.under_review}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{statusCounts.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{statusCounts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Hold</p>
                <p className="text-2xl font-bold">{statusCounts.on_hold}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusCounts.pending_review})</TabsTrigger>
          <TabsTrigger value="review">Under Review ({statusCounts.under_review})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {applications.map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              onViewDetails={setSelectedApplication}
              onUpdateStatus={updateApplicationStatus}
              actionLoading={actionLoading}
            />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {applications.filter(app => app.status === 'pending_review').map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              onViewDetails={setSelectedApplication}
              onUpdateStatus={updateApplicationStatus}
              actionLoading={actionLoading}
            />
          ))}
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          {applications.filter(app => app.status === 'under_review').map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              onViewDetails={setSelectedApplication}
              onUpdateStatus={updateApplicationStatus}
              actionLoading={actionLoading}
            />
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {applications.filter(app => app.status === 'approved').map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              onViewDetails={setSelectedApplication}
              onUpdateStatus={updateApplicationStatus}
              actionLoading={actionLoading}
            />
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {applications.filter(app => app.status === 'rejected').map((application) => (
            <ApplicationCard
              key={application._id}
              application={application}
              onViewDetails={setSelectedApplication}
              onUpdateStatus={updateApplicationStatus}
              actionLoading={actionLoading}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Partner Application Details</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Full Name</Label>
                      <p className="text-sm">{selectedApplication.firstName} {selectedApplication.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedApplication.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedApplication.phone}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Submitted</Label>
                      <p className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedApplication.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>Verification Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                       <Label className="text-sm font-medium mb-2 block">Selfie</Label>
                       <img
                         src={selectedApplication.documents.selfie}
                         alt="Selfie"
                         className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                         onClick={() => setSelectedImage(selectedApplication.documents.selfie)}
                       />
                     </div>
                     <div>
                       <Label className="text-sm font-medium mb-2 block">Aadhar Front</Label>
                       <img
                         src={selectedApplication.documents.aadharFront}
                         alt="Aadhar Front"
                         className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                         onClick={() => setSelectedImage(selectedApplication.documents.aadharFront)}
                       />
                     </div>
                     <div>
                       <Label className="text-sm font-medium mb-2 block">Aadhar Back</Label>
                       <img
                         src={selectedApplication.documents.aadharBack}
                         alt="Aadhar Back"
                         className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                         onClick={() => setSelectedImage(selectedApplication.documents.aadharBack)}
                       />
                     </div>
                  </div>
                </CardContent>
              </Card>

              {/* Review Actions */}
              {(selectedApplication.status === 'pending_review' || selectedApplication.status === 'under_review') && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                      <Textarea
                        id="reviewNotes"
                        placeholder="Add any notes about this application..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'approved', reviewNotes)}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Application
                      </Button>

                      <Button
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'rejected', reviewNotes)}
                        disabled={actionLoading}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>

                      <Button
                        onClick={() => updateApplicationStatus(selectedApplication._id, 'on_hold', reviewNotes)}
                        disabled={actionLoading}
                        variant="outline"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Put On Hold
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Review History */}
              {selectedApplication.reviewedAt && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{' '}
                        <Badge className={statusColors[selectedApplication.status]}>
                          {selectedApplication.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Reviewed on:</span>{' '}
                        {new Date(selectedApplication.reviewedAt!).toLocaleDateString()}
                      </p>
                      {selectedApplication.reviewNotes && (
                        <div>
                          <Label className="text-sm font-medium">Review Notes:</Label>
                          <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedApplication.reviewNotes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="Document"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function ApplicationCard({
  application,
  onViewDetails,
  onUpdateStatus,
  actionLoading
}: {
  application: PartnerApplication
  onViewDetails: (app: PartnerApplication) => void
  onUpdateStatus: (id: string, status: string, notes?: string) => void
  actionLoading: boolean
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="font-semibold">{application.firstName} {application.lastName}</h3>
              <Badge className={statusColors[application.status]}>
                {application.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {application.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {application.phone}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(application.submittedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(application)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>

            {(application.status === 'pending_review' || application.status === 'under_review') && (
              <>
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(application._id, 'approved')}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onUpdateStatus(application._id, 'rejected')}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}