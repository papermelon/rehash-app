import { redirect } from "next/navigation"

interface NoteDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params
  
  // Redirect to the new review page
  redirect(`/review/${id}`)
}