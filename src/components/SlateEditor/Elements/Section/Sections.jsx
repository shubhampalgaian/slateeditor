import { Transforms, Editor } from 'slate';
import Button from '../../common/Button';
import Icon from '../../common/Icon';

const SectionButton = ({ editor }) => {
  const insertSection = () => {
    const section = {
      type: 'section',
      children: [
        {
          type: 'heading',
          children: [{ text: '', bold: true, placeholder: true }],
          placeholder: true,
          default: 'add title...'
        },
        {
          type: 'paragraph',
          children: [{ text: '', placeholder: true }],
          default: 'add Paragraph...'
        }
      ]
    };

    Transforms.insertNodes(editor, section, {mode: 'highest'});
  };

  return (
    <Button onClick={e => {
      e.preventDefault();
      insertSection();
    }}>
        <Icon icon='section' />
    </Button>
  );
};

export default SectionButton;
