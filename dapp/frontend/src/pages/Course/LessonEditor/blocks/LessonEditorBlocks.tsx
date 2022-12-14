import { useCallback, useEffect, useState } from 'react';
import { Empty } from 'antd';
import cx from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { LessonBlock } from '~/api';
import { swapArrayItems } from '~/utils/swapArrayItems';
import { BlockListItem } from '../LessonEditor.types';
import {
  convertBlocksToEditorBlocks,
  createEditorBlock,
} from './blocks.helpers';
import { EditorBlock } from './blocks.types';
import { BlockMoveDirection, EditableBlock } from './EditableBlock';
import styles from './LessonEditorBlocks.module.less';

export type LessonEditorBlocksProps = {
  lessonBlocks: Array<LessonBlock>;
  onBlocksChange: (...args: any[]) => any;
  loading?: boolean;
};

export function LessonEditorBlocks({
  lessonBlocks,
  onBlocksChange,
  loading,
}: LessonEditorBlocksProps) {
  const { t } = useTranslation();
  const [editorBlocks, setEditorBlocks] = useState<Array<EditorBlock>>([]);
  const [, drop] = useDrop(() => ({
    accept: 'block',
    drop({ type }: BlockListItem) {
      const editorBlock = createEditorBlock(type);

      setEditorBlocks((blocks: Array<EditorBlock>) => [...blocks, editorBlock]);
    },
  }));

  useEffect(() => {
    convertBlocksToEditorBlocks(lessonBlocks).then(setEditorBlocks);
  }, []);

  useEffect(() => {
    onBlocksChange(editorBlocks);
  }, [editorBlocks, onBlocksChange]);

  const handleEdit = useCallback(
    (uuid: string, editedBlock: Partial<EditorBlock>) => {
      const blockIndex = editorBlocks.findIndex((block) => block.uuid === uuid);
      const newBlock = {
        ...editorBlocks[blockIndex],
        ...editedBlock,
      };

      setEditorBlocks((currentBlocks) => {
        const newBlocks = cloneDeep(currentBlocks);

        newBlocks.splice(blockIndex, 1, newBlock);
        return newBlocks;
      });
    },
    [editorBlocks],
  );

  const handleDelete = useCallback(
    (uuid: string) =>
      setEditorBlocks((blocks) =>
        blocks.filter((block) => block.uuid !== uuid),
      ),
    [],
  );

  const handleMove = useCallback(
    (uuid: string, direction: BlockMoveDirection) =>
      setEditorBlocks((blocks) => {
        const elementIndex = blocks.findIndex((block) => block.uuid === uuid);
        if (
          (direction === 'up' && elementIndex === 0) ||
          (direction === 'down' && elementIndex === blocks.length - 1)
        ) {
          return blocks;
        }

        const swapIndex =
          direction === 'up' ? elementIndex - 1 : elementIndex + 1;

        // Wait react rerender and scroll to moved block
        setTimeout(() => {
          const blockElement = document.getElementById(
            blocks[elementIndex].uuid,
          );

          if (!blockElement) return;
          blockElement.scrollIntoView({ behavior: 'smooth' });
        });

        return swapArrayItems(blocks, elementIndex, swapIndex);
      }),
    [],
  );

  const dropAreaClasses: string = cx(styles.lessonEditorBlocks, {
    [styles.lessonEditorBlocks_empty]: !editorBlocks?.length,
    [styles.lessonEditorBlocks_loading]: loading,
  });

  return (
    <div ref={drop} className={dropAreaClasses}>
      {editorBlocks.length ? (
        editorBlocks.map((block, index) => (
          <EditableBlock
            key={block.uuid}
            block={block}
            isFirst={index === 0}
            isLast={index === editorBlocks.length - 1}
            onEdit={handleEdit}
            onMove={handleMove}
            onDelete={handleDelete}
          />
        ))
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('blocks.drop_blocks_here')}
        />
      )}
    </div>
  );
}
