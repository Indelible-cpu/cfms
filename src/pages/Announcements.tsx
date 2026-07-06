import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ref, push, get, remove } from 'firebase/database';
import { db } from '../firebase';
import { AnnouncementRecord } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../lib/storage';

function Announcements() {
  const { profile } = useAuth();
  const { register, handleSubmit, reset } = useForm<AnnouncementRecord>({
    defaultValues: { type: 'General' },
  });
  const [message, setMessage] = useState('');
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const loadAnnouncements = async () => {
    try {
      const snapshot = await get(ref(db, 'announcements'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const arr = Object.entries(data).map(([id, val]) => ({ id, ...(val as any) }));
        arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAnnouncements(arr);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const onSubmit = async (data: AnnouncementRecord) => {
    setMessage('');
    // Prevent duplicate check (naive title check for this example)
    const exists = announcements.some(a => a.title.toLowerCase() === data.title.toLowerCase());
    if (exists) {
      setMessage('An announcement with this title already exists.');
      return;
    }

    try {
      setUploading(true);
      let imageUrl = '';
      if (file) {
        imageUrl = await uploadFile(file, 'announcements');
      }

      await push(ref(db, 'announcements'), {
        ...data,
        imageUrl,
        author: profile?.name || 'Unknown',
        createdAt: Date.now(),
      });
      setMessage('Announcement posted successfully!');
      reset();
      setFile(null);
      loadAnnouncements();
    } catch (error) {
      setMessage('Unable to post announcement.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const deleteAnnouncement = async (id?: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await remove(ref(db, `announcements/${id}`));
      loadAnnouncements();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 rounded-[32px] border border-earth/10 bg-white/90 p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-forest">Announcements & Events</h2>
        <p className="mt-2 text-sm text-slate-600">View upcoming activities and community achievements.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {profile?.role !== 'Community Member' ? (
          <form className="space-y-4 rounded-3xl border border-earth/10 bg-sand p-5 h-fit" onSubmit={handleSubmit(onSubmit)}>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-earth/70">Post Announcement</p>
            <label className="block text-sm text-forest">
              Title
              <input {...register('title', { required: true })} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              Type
              <select {...register('type')} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm">
                <option value="General">General News</option>
                <option value="Activity">Upcoming Activity</option>
                <option value="Achievement">Achievement Showcase</option>
              </select>
            </label>
            <label className="block text-sm text-forest">
              Content
              <textarea {...register('content', { required: true })} rows={4} className="mt-2 w-full rounded-3xl border border-earth/20 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="block text-sm text-forest">
              Photo (Optional)
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-2 w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-earth" 
              />
            </label>
            <button disabled={uploading} type="submit" className="w-full rounded-3xl bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-earth disabled:opacity-50">
              {uploading ? 'Posting...' : 'Post Announcement'}
            </button>
            {message && <p className="text-sm text-forest">{message}</p>}
          </form>
        ) : (
          <div className="rounded-3xl border border-earth/10 bg-sand p-5 h-fit">
            <p className="text-sm text-slate-600">Only officials can post announcements.</p>
          </div>
        )}

        <div className="space-y-4">
          {announcements.length ? (
            announcements.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-3xl border border-earth/10 bg-white shadow-sm">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} className="h-48 w-full object-cover" />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block rounded-full bg-forest/10 px-2 py-1 text-xs font-semibold text-forest">{item.type}</span>
                      <h3 className="mt-2 text-lg font-bold text-forest">{item.title}</h3>
                    </div>
                    {profile?.role !== 'Community Member' && (
                      <button onClick={() => deleteAnnouncement(item.id)} className="text-xs text-red-500 hover:underline">
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.content}</p>
                  <p className="mt-4 text-xs font-semibold text-slate-500">Posted by {item.author}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-earth/10 bg-white p-5 text-center shadow-sm">
              <p className="text-sm text-slate-600">No announcements posted yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Announcements;
