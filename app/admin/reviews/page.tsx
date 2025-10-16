"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Search, Filter, MoreHorizontal, ThumbsUp, Flag, CheckCircle, XCircle, AlertTriangle, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Review {
  _id: string
  userId: string
  hotelId: {
    _id: string
    name: string
    location: {
      city: string
      country: string
    }
  }
  rating: number
  title: string
  comment: string
  images: string[]
  isVerified: boolean
  status: 'pending' | 'approved' | 'rejected'
  helpful: number
  reported: boolean
  reportReason?: string
  createdAt: string
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusIcons = {
  pending: AlertTriangle,
  approved: CheckCircle,
  rejected: XCircle,
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [ratingFilter, setRatingFilter] = useState("all")

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    filterReviews()
  }, [reviews, searchTerm, activeTab, statusFilter, ratingFilter])

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews')
      const data = await response.json()
      setReviews(data.reviews || [])
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const filterReviews = () => {
    let filtered = reviews

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(review =>
        review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.hotelId.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status tab
    if (activeTab !== "all") {
      filtered = filtered.filter(review => review.status === activeTab)
    }

    // Filter by status dropdown
    if (statusFilter !== "all") {
      filtered = filtered.filter(review => review.status === statusFilter)
    }

    // Filter by rating
    if (ratingFilter !== "all") {
      const rating = parseInt(ratingFilter)
      filtered = filtered.filter(review => review.rating === rating)
    }

    setFilteredReviews(filtered)
  }

  const updateReviewStatus = async (reviewId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        setReviews(prev => prev.map(review =>
          review._id === reviewId ? { ...review, status: newStatus as any } : review
        ))
        toast.success(`Review ${newStatus}`)
      } else {
        throw new Error('Failed to update review')
      }
    } catch (error) {
      toast.error('Failed to update review status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/5</span>
      </div>
    )
  }

  const getStatusStats = () => {
    const stats = {
      all: reviews.length,
      pending: reviews.filter(r => r.status === 'pending').length,
      approved: reviews.filter(r => r.status === 'approved').length,
      rejected: reviews.filter(r => r.status === 'rejected').length,
    }
    return stats
  }

  const stats = getStatusStats()

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
          Review <span className="text-gradient">Management</span>
        </h1>
        <p className="text-muted-foreground">Monitor and moderate user reviews and ratings</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by review title, content, or hotel name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? "No reviews found matching your search." : "No reviews found."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredReviews.map((review) => {
                const StatusIcon = statusIcons[review.status]
                return (
                  <Card key={review._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{review.title}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <span className="font-medium">{review.hotelId.name}</span>
                                <span className="mx-2">•</span>
                                <span>{review.hotelId.location.city}, {review.hotelId.location.country}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={statusColors[review.status]}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                              </Badge>
                              {review.isVerified && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                              {review.reported && (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  <Flag className="w-3 h-3 mr-1" />
                                  Reported
                                </Badge>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  {review.status === 'pending' && (
                                    <>
                                      <DropdownMenuItem onClick={() => updateReviewStatus(review._id, 'approved')}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => updateReviewStatus(review._id, 'rejected')}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {review.status === 'approved' && (
                                    <DropdownMenuItem onClick={() => updateReviewStatus(review._id, 'rejected')}>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  )}
                                  {review.status === 'rejected' && (
                                    <DropdownMenuItem onClick={() => updateReviewStatus(review._id, 'approved')}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="mb-3">
                            {renderStars(review.rating)}
                          </div>

                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {review.comment}
                          </p>

                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2 mb-3">
                              {review.images.slice(0, 3).map((image, index) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Review image ${index + 1}`}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              ))}
                              {review.images.length > 3 && (
                                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">
                                  +{review.images.length - 3}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>By User ID: {review.userId.slice(-8)}</span>
                              <span>•</span>
                              <span>{formatDate(review.createdAt)}</span>
                              <span>•</span>
                              <div className="flex items-center">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                <span>{review.helpful} helpful</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              {review.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => updateReviewStatus(review._id, 'approved')}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => updateReviewStatus(review._id, 'rejected')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  )
}