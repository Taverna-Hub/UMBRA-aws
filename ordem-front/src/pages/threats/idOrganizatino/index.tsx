import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Navigation } from '../../../components/Navigation';
import { Select } from '../../../components/Select';
import * as S from './styles';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Element,
  ElementService,
} from '../../../services/http/elements/ElementService';
import { useCallback, useEffect, useState } from 'react';
import { Textarea } from '../../../components/Textarea';
import {
  CreateOrganizationProps,
  GetThreatProps,
  Member,
  ThreatService,
} from '../../../services/http/threats/ThreatService';
import { useNavigate, useParams } from 'react-router';
import { IconButton } from '../../../components/IconButton';
import { FiPlus } from 'react-icons/fi';

type CreateMemberProps = {
  name: string;
  role: {
    label: string;
    value: string;
  };
};

export function UpdateOrganization() {
  const { id } = useParams();

  const [names, setNames] = useState<string[]>([]);
  const [nameInput, setNameInput] = useState('');

  const [members, setMembers] = useState<Omit<Member, 'id_member'>[]>([]);
  const navigate = useNavigate();

  const { control, register, setValue, getValues, handleSubmit } = useForm<
    CreateMemberProps & CreateOrganizationProps
  >();

  const { data: elements } = useQuery({
    queryKey: ['elements'],
    queryFn: () => ElementService.findAll(),
  });

  const { data: threat } = useQuery<GetThreatProps>({
    queryKey: ['threat', id],
    queryFn: () => ThreatService.findOrganizationById(id),
    enabled: !!id,
  });

  const { mutate } = useMutation({
    mutationFn: async (data: CreateMemberProps) => {
      const reformattedData = {
        name: data.name,
        role: data.role.value,
      };

      await ThreatService.addMember(id!, reformattedData as Member);
      return reformattedData;
    },
    onSuccess: (newMember) => {
      setMembers((prev) => [...prev, newMember]);
    },
  });

  function handleAddNames() {
    if (nameInput.trim() !== '') {
      setNames((old) => [...old, nameInput]);
      setNameInput('');
    }
  }

  const elementsOptions = elements?.map((element: Element) => {
    return {
      label: element.name,
      value: element.id_element,
    };
  });

  const roleOptions = [
    {
      value: 'Lider',
      label: 'Lider',
    },
    {
      value: 'Pesquisador',
      label: 'Pesquisador',
    },
    {
      value: 'Ocultista',
      label: 'Ocultista',
    },
    {
      value: 'Simpatizante',
      label: 'Simpatizante',
    },
  ];

  function handleAddMember() {
    const data = getValues();
    mutate(data);
  }

  const loadThreatData = useCallback(() => {
    if (threat) {
      const elements = threat.elements.map((elementId, i) => ({
        value: elementId,
        label: threat.elementsNames[i],
      }));

      setNames(threat.names || []);
      setValue('description', threat.description);
      setValue('elements', elements);
    }
  }, [threat]);

  const loadMembers = useCallback(async () => {
    if (!id) return;
    const data = await ThreatService.getMembers(id);
    setMembers(data);
  }, [id]);

  useEffect(() => {
    loadThreatData();
    loadMembers();
  }, [loadThreatData, loadMembers]);

  const handleUpdateOrganization = async (data: CreateOrganizationProps) => {
    if (!id) return;
    await ThreatService.updateOrganization({
      id_threat: id,
      new_names: names,
      new_description: data.description,
      new_elements: data.elements.map((el: any) => el.value),
    });
    navigate('/ameacas');
  };

  return (
    <S.Wrapper>
      <Helmet title="Editar Ameaça" />
      <S.FormWrapper>
        <div>
          <h2>Editar ameaça</h2>
        </div>

        <S.Form onSubmit={handleSubmit(handleUpdateOrganization)}>
          <S.InputWrapper>
            <S.NamesListWrapper>
              <h2>Nomes</h2>
              <div className="inputsection">
                <Input
                  label="Nomes"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
                <IconButton
                  onClick={() => handleAddNames()}
                  icon={<FiPlus />}
                />
              </div>
              <S.List>
                {names?.length > 0 &&
                  names.map((name, index) => (
                    <S.ListItem key={index}>{name}</S.ListItem>
                  ))}
              </S.List>
            </S.NamesListWrapper>
          </S.InputWrapper>

          <Select
            control={control}
            options={elementsOptions}
            label="Elementos"
            name="elements"
            isMulti
          />

          <Textarea label="Descrição" {...register('description')} />

          <div />
          <div />

          <S.Actions>
            <Button
              onClick={() => navigate('/ameacas')}
              variant="secondary"
              type="button"
            >
              Cancelar
            </Button>

            <Button type="submit">Atualizar ameaça</Button>
          </S.Actions>
        </S.Form>
      </S.FormWrapper>

      <S.FormWrapper>
        <div>
          <h2>Adicionar membros</h2>
        </div>

        <S.Form>
          <Input label="Nome do membro" {...register('name')} />

          <Select
            control={control}
            options={roleOptions}
            label="Papel"
            name="role"
          />
          <div />
          <Button type="button" onClick={() => handleAddMember()}>
            Adicionar membro
          </Button>
        </S.Form>
        <S.MembersList>
          {members && members.length > 0 ? (
            <S.TableContainer>
              <S.Table>
                <S.TableHead>
                  <tr>
                    <th>Nome</th>
                    <th>Papel</th>
                  </tr>
                </S.TableHead>
                <tbody>
                  {members.map((member: Omit<Member, 'id_member'>, idx) => (
                    <S.TableRow key={idx}>
                      <td>{member.name}</td>
                      <td>{member.role}</td>
                    </S.TableRow>
                  ))}
                </tbody>
              </S.Table>
            </S.TableContainer>
          ) : (
            <div>
              <h3>Nenhum membro encontrado</h3>
            </div>
          )}
        </S.MembersList>
      </S.FormWrapper>

      <Navigation />
    </S.Wrapper>
  );
}
