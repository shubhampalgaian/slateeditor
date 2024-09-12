import { Transforms, Editor } from 'slate';
import Button from '../../common/Button';
import Icon from '../../common/Icon';

const TopicButton = ({ editor }) => {
  const insertTopic = () => {
    const topic = {
      type: 'topic',
      children: [
        {
          type: 'title',
          children: [{ text: '', placeholder: true, bold: true }],
          placeholder: true,
          default: 'topic title...'
        },
        {
          type: 'body',
          children: [
            {
              type: 'paragraph',
              children: [{ text: '', placeholder: true }],
              placeholder: true,
              default: 'topic para...'
            }
          ]
        }
      ]
    };

    Transforms.insertNodes(editor, topic, { at: editor.selection });
  };

  return (
    <Button onClick={e => {
      e.preventDefault();
      insertTopic();
    }}>
      <Icon icon='topic' />
    </Button>
  );
};

export default TopicButton;
