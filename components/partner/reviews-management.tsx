"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Reply, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Review {
  _id: string
  bookingId: string
  hotelId: {
    _id: string
    name: string
  }
  guestId: {
    _id: string
    displayName: string
    email: string
  }
  rating: number
  comment: string
  response?: string
  responseDate?: string
  createdAt: string
  status: 'pending' | 'responded'
}

export function PartnerReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [responseText, setResponseText] = useState("")
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [responding, setResponding] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchReviews()
    }
  }, [user])

  const fetchReviews = async () => {
    try {
      // Fetch reviews for partner's hotels directly
      const reviewsResponse = await fetch(`/api/reviews?ownerId=${user?.uid}`)
      const reviewsData = await reviewsResponse.json()
      const partnerReviews = reviewsData.reviews || []

      setReviews(partnerReviews)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToReview = async () => {
    if (!selectedReview || !responseText.trim()) return

    setResponding(true)
    try {
      const response = await fetch(`/api/reviews/${selectedReview._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response: responseText,
          responseDate: new Date().toISOString()
        })
      })

      if (response.ok) {
        toast.success("Response sent successfully!")
        setShowResponseDialog(false)
        setResponseText("")
        setSelectedReview(null)
        fetchReviews() // Refresh reviews
      } else {
        toast.error("Failed to send response")
      }
    } catch (error) {
      console.error('Error responding to review:', error)
      toast.error("Failed to send response")
    } finally {
      setResponding(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return total / reviews.length
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      const rating = review.rating as keyof typeof distribution
      distribution[rating]++
    })
    return distribution
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const ratingDistribution = getRatingDistribution()
  const pendingReviews = reviews.filter(r => r.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">{getAverageRating().toFixed(1)}</p>
              </div>
              <div className="flex">
                {renderStars(Math.round(getAverageRating()))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Responses</p>
                <p className="text-2xl font-bold">{pendingReviews.length}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">
                  {reviews.length > 0 ? Math.round(((reviews.length - pendingReviews.length) / reviews.length) * 100) : 0}%
                </p>
              </div>
              <ThumbsUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${reviews.length > 0 ? (ratingDistribution[rating as keyof typeof ratingDistribution] / reviews.length) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviews found.</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{review.guestId?.displayName || 'Anonymous Guest'}</h3>
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <Badge variant={review.status === 'responded' ? 'default' : 'secondary'}>
                          {review.status === 'responded' ? 'Responded' : 'Pending Response'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {review.hotelId?.name} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </div>

                  {review.response && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Reply className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">Your Response</span>
                        <span className="text-sm text-muted-foreground">
                          {review.responseDate ? new Date(review.responseDate).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.response}</p>
                    </div>
                  )}

                  {review.status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review)
                          setResponseText(review.response || "")
                          setShowResponseDialog(true)
                        }}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Respond
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{selectedReview.guestId?.displayName}</span>
                  <div className="flex">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedReview.hotelId?.name} • {new Date(selectedReview.createdAt).toLocaleDateString()}
                </p>
                <p>{selectedReview.comment}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Response</label>
                <Textarea
                  placeholder="Write a thoughtful response to this guest..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResponseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRespondToReview} disabled={responding || !responseText.trim()}>
              {responding ? "Sending..." : "Send Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}