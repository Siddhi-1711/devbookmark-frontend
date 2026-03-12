 import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppLayout from '../layout/AppLayout'
import client from '../api/client'
import { useAuth } from '../store/authStore'
import ResourceCard from '../components/ResourceCard'
import { FolderOpen, ArrowLeft, Globe, Lock, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CollectionDetailPage() {
  const { collectionId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollection()
  }, [collectionId])

  const fetchCollection = async () => {
    setLoading(true)
    try {
      const res = await client.get(`/api/collections/${collectionId}`)
      setCollection(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

const removeResource = async (resourceId) => {
  try {
    await client.delete(`/api/collections/${collectionId}/resources/${resourceId}`)
    setCollection(prev => ({
      ...prev,
      items: prev.items.filter(item => item.resourceId !== resourceId)
    }))
  } catch (err) {
    console.error(err)
  }
}

  if (loading) return (
    <AppLayout maxWidth="max-w-3xl">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-48 mb-6" />
        <div className="h-4 bg-gray-800 rounded w-32 mb-8" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-800 rounded-xl" />
        ))}
      </div>
    </AppLayout>
  )

  if (!collection) return (
    <AppLayout maxWidth="max-w-3xl">
      <p className="text-gray-400 text-center pt-20">Collection not found</p>
    </AppLayout>
  )

  const isOwner = user?.id === collection.ownerId

  return (
    <AppLayout maxWidth="max-w-3xl">
      <button
        onClick={() => navigate('/collections')}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0">
            <FolderOpen size={22} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-white text-xl font-bold">{collection.name}</h1>
            {collection.description && (
              <p className="text-gray-400 text-sm mt-1">{collection.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {collection.isPublic
                ? <span className="flex items-center gap-1"><Globe size={12} /> Public</span>
                : <span className="flex items-center gap-1"><Lock size={12} /> Private</span>
              }
              <span>{collection.resources?.length ?? 0} resources</span>
            </div>
          </div>
        </div>
      </div>

     {collection.items?.length === 0 ? (
       <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
         <FolderOpen size={40} className="text-gray-700 mx-auto mb-3" />
         <p className="text-gray-500 mb-3">No resources in this collection yet.</p>
         <button
           onClick={() => navigate(`/explore?pickFor=${collectionId}&pickName=${encodeURIComponent(collection.name)}`)}
           className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
         >
           Browse Explore to add resources
         </button>
       </div>
     ) : (
       <div className="space-y-3">
         {collection.items?.map(item => (
           <div key={item.resourceId} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">
             <div className="flex items-start justify-between gap-4">
               <Link to={`/resources/${item.resourceId}`} className="flex-1 min-w-0">
                 <h3 className="text-white font-medium hover:text-blue-400 transition mb-1">
                   {item.title}
                 </h3>
                 {item.description && (
                   <p className="text-gray-400 text-sm line-clamp-2 mb-2">{item.description}</p>
                 )}
                 {item.tags?.size > 0 && (
                   <div className="flex flex-wrap gap-1">
                     {[...item.tags].map(tag => (
                       <span key={tag} className="px-2 py-0.5 bg-gray-800 text-blue-400 text-xs rounded">
                         #{tag}
                       </span>
                     ))}
                   </div>
                 )}
               </Link>
               <div className="flex items-center gap-2 shrink-0">
                 {item.link && (
                   <a href={item.link} target="_blank" rel="noopener noreferrer"
                     className="text-blue-400 hover:text-blue-300 text-xs">
                     Visit
                   </a>
                 )}
                 {isOwner && (
                   <button
                     onClick={() => removeResource(item.resourceId)}
                     className="text-gray-600 hover:text-red-400 transition text-xs"
                   >
                     <Trash2 size={14} />
                   </button>
                 )}
               </div>
             </div>
           </div>
         ))}
       </div>
     )}
    </AppLayout>
  )
}