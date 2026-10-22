import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Agent,
  AgentService,
} from '../../../services/http/agents/AgentService';
import { TeamService } from '../../../services/http/teams/TeamService';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { Button } from '../../../components/Button';
import { Navigation } from '../../../components/Navigation';
import * as S from './styles';

type Option = {
  label: string;
  value: string;
};

type TeamForm = {
  agents: Option[];
};

export function UpdateTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [teamAgents, setTeamAgents] = useState<Agent[]>([]);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const { control, getValues, handleSubmit, resetField } = useForm<TeamForm>();

  const { data: teamData } = useQuery({
    queryKey: ['team', id],
    queryFn: () => TeamService.findById(id!),
    enabled: !!id,
  });

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => AgentService.findAll(),
  });

  const { data: initialAgents } = useQuery({
    queryKey: ['team-agents', id],
    queryFn: () => TeamService.findAgentsById(id!),
    enabled: !!teamData,
  });

  useEffect(() => {
    if (agents) setAllAgents(agents);
  }, [agents]);

  useEffect(() => {
    if (initialAgents && agents) {
      const formatted = initialAgents
        .map((item) =>
          typeof item === 'string' ? agents.find((a) => a.id === item) : item,
        )
        .filter(Boolean) as Agent[];
      setTeamAgents(formatted);
      setOriginalIds(formatted.map((a) => a.id));
    }
  }, [initialAgents, agents]);

  const agentOptions = allAgents.map((agent) => ({
    label: agent.name,
    value: agent.id,
  }));

  const { mutate } = useMutation({
    mutationFn: async () => {
      if (!teamData) throw new Error('Dados da equipe não carregados');

      const newIds = teamAgents.map((a) => a.id);
      const origIds = originalIds;

      const added = newIds.filter((id) => !origIds.includes(id));
      if (added.length) {
        await TeamService.addAgents(id!, added);
      }

      const removed = origIds.filter((id) => !newIds.includes(id));
      if (removed.length) {
        await Promise.all(
          removed.map((agentId) => TeamService.removeAgent(id!, agentId)),
        );
      }

      return { addedCount: added.length, removedCount: removed.length };
    },
    onSuccess: ({ addedCount, removedCount }) => {
      if (addedCount) toast.success(`${addedCount} agente(s) adicionados`);
      if (removedCount) toast.success(`${removedCount} agente(s) removidos`);
      if (!addedCount && !removedCount) toast('Nenhuma alteração detectada');
      queryClient.invalidateQueries({ queryKey: ['team', id] });
      queryClient.invalidateQueries({ queryKey: ['team-agents', id] });
      navigate('/equipes');
    },
    onError: (err) => {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Erro ao atualizar equipe!');
    },
  });

  const handleAddAgents = () => {
    const selected = getValues().agents || [];
    if (!Array.isArray(selected)) {
      console.error('selected não é um array válido', selected);
      return;
    }
    const toAdd = selected
      .map((opt) => allAgents.find((a) => a.id === opt.value))
      .filter(Boolean) as Agent[];
    const unique = toAdd.filter(
      (el) => !teamAgents.some((a) => a.id === el.id),
    );
    setTeamAgents((prev) => [...prev, ...unique]);
    resetField('agents');
  };

  const handleRemoveAgent = (agentId: string) => {
    setTeamAgents((prev) => prev.filter((a) => a.id !== agentId));
  };

  const handleUpdateTeam = () => {
    mutate();
  };

  return (
    <S.Wrapper>
      <h1>Editar Equipe</h1>

      <S.GridWrapper onSubmit={handleSubmit(handleUpdateTeam)}>
        <S.GridColumn>
          <S.TeamBasicInfo>
            <Input
              label="Nome da equipe"
              value={teamData?.name || ''}
              disabled
            />
            <Input
              label="Especialização"
              value={teamData?.specialization || ''}
              disabled
            />
          </S.TeamBasicInfo>
        </S.GridColumn>

        <S.GridColumn>
          <S.TeamSelectAgents>
            <h2>Modificar Agentes</h2>

            <S.SelectAgentsInterface>
              <Select
                control={control}
                options={agentOptions}
                name="agents"
                placeholder="Selecionar agentes"
                isMulti
              />
              <Button onClick={handleAddAgents} type="button">
                Adicionar
              </Button>
            </S.SelectAgentsInterface>

            <S.AgentsHeader>
              <span>Agentes na equipe</span>
            </S.AgentsHeader>

            {teamAgents.map((agent) => (
              <S.AgentCard key={agent.id}>
                <h3>{agent.name}</h3>
                <p>| {agent.rank_agent}</p>
                <Button size="sm" onClick={() => handleRemoveAgent(agent.id)}>
                  Remover
                </Button>
              </S.AgentCard>
            ))}
          </S.TeamSelectAgents>

          <S.GridButtons>
            <Button type="button" onClick={() => navigate('/equipes')}>
              Cancelar
            </Button>
            <Button type="submit">Salvar alterações</Button>
          </S.GridButtons>
        </S.GridColumn>
      </S.GridWrapper>

      <Navigation />
    </S.Wrapper>
  );
}
