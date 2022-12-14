import { PropsWithChildren, useCallback, useMemo } from 'react';
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Course } from '~/api';
import { CourseImage } from '~/components/CourseImage';
import { useCourseLevel } from '~/hooks/useCourseLevel';
import styles from './CourseCard.module.less';

const { Title, Text } = Typography;

export type CourseCardProps = PropsWithChildren<{
  course: Course;
  link?: string;
  onOpenCourseInfo?: (e: Course) => void;
}>;

export function CourseCard(props: CourseCardProps) {
  const { course, children, onOpenCourseInfo, link } = props;

  const level = useCourseLevel(course.level);

  const handleClick = useCallback(() => {
    if (onOpenCourseInfo) {
      onOpenCourseInfo(course);
    }
  }, [course, onOpenCourseInfo]);

  const image = useMemo(
    () => <CourseImage imageId={course.imageId} title={course.title} />,
    [course.imageId, course.title],
  );
  const cover = useMemo(
    () =>
      link ? (
        <Link to={link}>{image}</Link>
      ) : (
        <div onClick={handleClick}>{image}</div>
      ),
    [handleClick, image, link],
  );

  return (
    <Card className={styles.courseCard} hoverable cover={cover}>
      <div className={styles.courseCard_body}>
        <div className={styles.courseCard_body_header}>
          <Title level={5} ellipsis>
            {course.title}
          </Title>
          {children}
        </div>
        <Text type="secondary">{level}</Text>
      </div>
    </Card>
  );
}
