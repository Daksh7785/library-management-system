import { useEffect, useState } from 'react';
import { fetchCourses, enrollInCourse, fetchStudentEnrollments } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Course, Enrollment } from '../types';
import { motion } from 'framer-motion';

export const LMS = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const [courseData, enrollmentData] = await Promise.all([
          fetchCourses(user.libraryId),
          user.role === 'student' ? fetchStudentEnrollments(user.id) : Promise.resolve([])
        ]);
        setCourses(courseData);
        setEnrollments(enrollmentData);
      } catch (err) {
        console.error('LMS load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    try {
      await enrollInCourse(courseId, user.id, user.libraryId);
      // Refresh enrollments
      const updated = await fetchStudentEnrollments(user.id);
      setEnrollments(updated);
    } catch (err) {
      alert('Enrollment failed. Already enrolled?');
    }
  };

  const isEnrolled = (courseId: string) => enrollments.some(e => e.courseId === courseId);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-1.5px' }}>Unified Learning Hub</h1>
          <p style={{ color: '#94a3b8', fontSize: '16px' }}>Master your curriculum through structured reading paths and courses.</p>
        </div>
        {user?.role === 'teacher' && (
          <button style={{ padding: '12px 24px', borderRadius: '12px', background: '#8b5cf6', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
            + Create New Course
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: '100px' }}>Synchronizing course material...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {courses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ y: -5 }}
              style={{
                background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)',
                padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#8b5cf6' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '1px' }}>{course.code}</span>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>{course.title}</h3>
                </div>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#94a3b8' }}>menu_book</span>
                </div>
              </div>

              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, flex: 1 }}>{course.description}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#8b5cf6' }}>
                  {course.teacher?.name?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{course.teacher?.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Course Facilitator</div>
                </div>
              </div>

              {user?.role === 'student' && (
                <button
                  disabled={isEnrolled(course.id)}
                  onClick={() => handleEnroll(course.id)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: isEnrolled(course.id) ? 'rgba(16, 185, 129, 0.1)' : '#8b5cf6',
                    color: isEnrolled(course.id) ? '#10b981' : '#fff',
                    border: 'none', fontWeight: 700, cursor: isEnrolled(course.id) ? 'default' : 'pointer',
                    marginTop: '8px', transition: 'all 0.2s'
                  }}
                >
                  {isEnrolled(course.id) ? 'Enrolled ✓' : 'Enroll in Course'}
                </button>
              )}
            </motion.div>
          ))}
          
          {courses.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.05)' }}>
               <h3 style={{ color: '#94a3b8', fontSize: '20px', fontWeight: 600 }}>No courses available in your institution yet.</h3>
               <p style={{ color: '#64748b' }}>Contact your academic admin to initialize curriculum data.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
