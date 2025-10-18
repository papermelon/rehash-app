"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Copy, Download, Check, ChevronUp, ChevronDown, 
  MessageCircle, Share2, Award, MoreHorizontal, 
  ArrowLeft, Search
} from "lucide-react"
import { toast } from "sonner"
import type { RedditThread, Comment } from "@/lib/types"

interface RedditThreadProps {
  redditJson: RedditThread
  title?: string
}

export function RedditThread({ redditJson, title = "Discussion Thread" }: RedditThreadProps) {
  const [copied, setCopied] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5]))
  const [votedComments, setVotedComments] = useState<Map<string, 'up' | 'down' | null>>(new Map())

  const toggleComment = (index: number) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedComments(newExpanded)
  }

  const handleVote = (commentId: string, voteType: 'up' | 'down') => {
    const newVoted = new Map(votedComments)
    const currentVote = newVoted.get(commentId)
    if (currentVote === voteType) {
      newVoted.set(commentId, null)
    } else {
      newVoted.set(commentId, voteType)
    }
    setVotedComments(newVoted)
  }

  const formatUpvotes = (upvotes: number) => {
    if (upvotes >= 1000) {
      return `${(upvotes / 1000).toFixed(1)}k`
    }
    return upvotes.toString()
  }

  const getRandomAvatar = (seed: string) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500']
    const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  const exportToMarkdown = () => {
    let markdown = `# ${redditJson.title}\n\n`
    markdown += `**Posted by:** ${redditJson.op}\n\n`
    markdown += `---\n\n`

    redditJson.comments.forEach((comment, index) => {
      markdown += `## ${comment.user} (${formatUpvotes(comment.up)} upvotes)\n\n`
      markdown += `${comment.body}\n\n`
      
      if (comment.replies && comment.replies.length > 0) {
        markdown += `### Replies:\n\n`
        comment.replies.forEach(reply => {
          markdown += `- **${reply.user}** (${formatUpvotes(reply.up)} upvotes): ${reply.body}\n\n`
        })
      }
      markdown += `---\n\n`
    })

    return markdown
  }

  const handleCopy = async () => {
    try {
      const markdown = exportToMarkdown()
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      toast.success("Thread copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy thread")
    }
  }

  const handleDownload = () => {
    try {
      const markdown = exportToMarkdown()
      const blob = new Blob([markdown], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_reddit_thread.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success("Thread downloaded!")
    } catch (error) {
      toast.error("Failed to download thread")
    }
  }

  if (!redditJson || !redditJson.title) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Reddit Thread
          </CardTitle>
          <CardDescription>
            A Reddit-style discussion thread will appear here after generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No thread generated yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const CommentComponent = ({ comment, index, isReply = false }: { comment: Comment; index: number; isReply?: boolean }) => {
    const commentId = `${index}-${comment.user}`
    const vote = votedComments.get(commentId)
    
    return (
      <div className={`flex gap-2 ${isReply ? 'ml-10 mt-2' : ''}`}>
        {/* Voting column */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-950 ${vote === 'up' ? 'text-orange-500' : 'text-gray-400'}`}
            onClick={() => handleVote(commentId, 'up')}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <span className={`text-xs font-bold ${vote === 'up' ? 'text-orange-500' : vote === 'down' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>
            {formatUpvotes(comment.up)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className={`h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-950 ${vote === 'down' ? 'text-blue-500' : 'text-gray-400'}`}
            onClick={() => handleVote(commentId, 'down')}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Comment content */}
        <div className="flex-1">
          {/* User info */}
          <div className="flex items-center gap-2 mb-1">
            <div className={`h-6 w-6 rounded-full ${getRandomAvatar(comment.user)} flex items-center justify-center text-white text-xs font-bold`}>
              {comment.user.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-sm">{comment.user}</span>
            <span className="text-xs text-gray-500">• 1h ago</span>
          </div>

          {/* Comment body */}
          <div className="text-sm leading-relaxed mb-2">
            {comment.body}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <MessageCircle className="h-3 w-3 mr-1" />
              Reply
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Award className="h-3 w-3 mr-1" />
              Award
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-800">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2 border-l-2 border-gray-200 dark:border-gray-800 pl-4">
              {expandedComments.has(index) ? (
                <>
                  {comment.replies.map((reply, replyIndex) => (
                    <CommentComponent
                      key={replyIndex}
                      comment={reply}
                      index={`${index}-${replyIndex}` as any}
                      isReply={true}
                    />
                  ))}
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComment(index)}
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 h-7 px-2"
                >
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show {comment.replies.length} more {comment.replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with export buttons */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium text-muted-foreground">Reddit Thread Preview</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={copied}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main post card */}
      <Card className="mb-4 overflow-hidden">
        <div className="flex">
          {/* Left voting column */}
          <div className="w-12 bg-gray-50 dark:bg-gray-900 flex flex-col items-center gap-1 pt-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-orange-100 dark:hover:bg-orange-950 text-gray-400"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
              {formatUpvotes(redditJson.comments.reduce((sum, c) => sum + c.up, 0))}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-950 text-gray-400"
            >
              <ChevronDown className="h-5 w-5" />
            </Button>
          </div>

          {/* Post content */}
          <div className="flex-1 p-4">
            {/* Post header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">r/</span>
              </div>
              <span className="text-xs font-bold">r/GeneratedDiscussion</span>
              <span className="text-xs text-gray-500">• 1h ago</span>
              <Badge variant="secondary" className="text-xs uppercase">
                Discussion
              </Badge>
              <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Post title */}
            <h1 className="text-xl font-bold mb-3">{redditJson.title}</h1>

            {/* Post body */}
            {redditJson.op && (
              <div className="text-sm leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
                {redditJson.op}
              </div>
            )}

            {/* Post actions */}
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 border-t pt-2">
              <Button variant="ghost" size="sm" className="h-8 hover:bg-gray-100 dark:hover:bg-gray-800">
                <MessageCircle className="h-4 w-4 mr-1" />
                {redditJson.comments.length} Comments
              </Button>
              <Button variant="ghost" size="sm" className="h-8 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Award className="h-4 w-4 mr-1" />
                Award
              </Button>
              <Button variant="ghost" size="sm" className="h-8 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments section */}
      <Card>
        <CardContent className="p-4">
          {/* Comment input */}
          <div className="mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
              <Input
                placeholder="Add your reply"
                className="flex-1"
                readOnly
              />
            </div>
          </div>

          {/* Sort and search */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Sort by:</span>
              <Button variant="ghost" size="sm" className="h-7 font-bold">
                Best
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Comments"
                className="pl-8 h-8 w-48 text-sm"
                readOnly
              />
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-4">
            {redditJson.comments.map((comment, index) => (
              <CommentComponent key={index} comment={comment} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
